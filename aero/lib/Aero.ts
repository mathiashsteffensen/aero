// External dependencies
import * as fs from "fs"
import * as path from "path"

// Internal dependencies
import AeroWeb from "@aero/aero-web"
import Routes from "@aero/aero-web/dist/typings/Routes"
import AeroRecord from "@aero/aero-record"

// Load the library
import Application from "./Application"
import Root from "./Root"
import Config from "./Config"
import ENV from "./ENV"
import Logger from "./Logger"
import ViewHelpers from "./ViewHelpers"
import FormHelpers from "./FormHelpers"

/**
 * abstract class defining a full-fledged web application
 */
export default abstract class Aero {
	/**
	 * Exports the Application class so that it can be imported from the core Aero module.
	 *
	 * @example
	 * ```
	 * import Aero from "@aero/aero";
	 *
	 * export default class Application extends Aero.Application {}
	 * ```
	 */
	static Application = Application

	/**
	 * Your application instance, is undefined until `Aero.initialize` has been called
	 */
	static application: Application

	/**
	 * Routes for your application, is undefined until `Aero.initialize` has been called
	 */
	static routes: Routes

	/**
	 * Environment helper for your application
	 */
	static env = new ENV()

	/**
	 * Application wide logger
	 *
	 * @example
	 * ```
	 * Aero.logger.info("This is an info level message")
	 * ```
	 */
	static logger = new Logger()

	/**
	 * Construct paths from the root of your application
	 *
	 * @example
	 * ```
	 * const pathToTmpFile = Aero.root.join("tmp/filename.txt")
	 * ```
	 */
	static root = new Root()

	/**
	 * The configuration for your application
	 */
	static config = new Config()

	/**
	 * The version of Aero being run
	 */
	static version: string = JSON.parse(fs.readFileSync(path.join(__dirname, "../../package.json")).toString()).version

	/**
	 * Initialize your Aero application
	 *
	 * @remarks
	 * Imports config/Application and instantiates an app, configures, and initializes it.
	 *
	 * @param applicationPath - The path where your Application class can be found
	 */
	static async initialize(applicationPath = "config/Application") {
		try {
			const ApplicationClass = (await import(this.root.join(applicationPath))).default
			this.application = new ApplicationClass(this)

			// Configure and initialize Aero.Application instance
			this.application.configure(this.config)
			await this.application.initialize(this)

			// Load the routes
			this.routes = new AeroWeb.Routes(
				this.application.controllers,
				this.application.server,
				this.application.viewEngine,
				{
					...new ViewHelpers(this.application.assetPipeline.assetManifest),
					...new FormHelpers(),
				},
			)
			await import(this.root.join(this.config.routesFile))

			// Establish connection to AeroRecord
			AeroRecord.establishConnection(
				this.env.toString(),
				this.root.join(this.config.databaseFile),
			)

			return this
		} catch (e) {
			this.logger.fatal(e)
			return this // Just for type-checking, Logger.fatal will exit the process
		}
	}

	/**
	 * Start the Aero application
	 *
	 * @param aero - static Aero class, mostly passed to make chaining prettier
	 *
	 * @example
	 * The default start up script for an Aero application
	 * ```
	 * import Aero from "@aero/aero";
	 *
	 * Aero
	 *   .initialize("config/Application")
	 *   .then(Aero.start)
	 *   .catch(Aero.logger.fatal)
	 * ```
	 */
	static async start(aero: typeof Aero) {
		if (!aero.application) {
			throw new Error("You are attempting to start Aero without initializing an application")
		}

		await aero.application.start(aero.version)
	}
}
