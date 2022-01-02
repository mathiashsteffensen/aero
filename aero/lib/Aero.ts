import * as fs from "fs"
import * as path from "path"
import pino from "pino"

import Application from "./Application"
import Root from "./Root"
import Config from "./Config"
import Controller from "./Controller"
import Routes from "./Routes"
import ENV from "./ENV"

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
	 * Exports the Controller class so that it can be imported from the core Aero module.
	 *
	 * @example
	 * ```
	 * import Aero from "@aero/aero";
	 *
	 * export default class BaseController extends Aero.Controller {}
	 * ```
	 */
	static Controller = Controller

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
	static logger = pino({
		transport: {
			target: "pino-pretty",
			options: {
				colorize: true,
			},
		},
	})

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
	 * Also compiles frontend assets via ESBuild
	 *
	 * @param applicationPath - The path where your Application class can be found
	 */
	static async initialize(applicationPath = "config/Application") {
		try {
			this.application = new (await import(this.root.join(applicationPath))).default(this)

			this.application.configure(this.config)
			await this.application.initialize(this)

			this.routes = new Routes(this.application)

			await import(this.root.join("config/routes"))

			return this
		} catch (e) {
			this.logger.error("%s", e)
			process.exit()
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
	 *   .catch(Aero.logger.error)
	 * ```
	 */
	static async start(aero: typeof Aero) {
		if (!aero.application) {
			throw new Error("You are attempting to start Aero without initializing an application")
		}

		await aero.application.start(aero.version)
	}
}
