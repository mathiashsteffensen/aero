import YAML from "yaml"
import { ConfigurationOptions } from "i18n"

// Internal dependencies
import AeroWeb from "@aero/aero-web"
import Routes from "@aero/aero-web/dist/typings/Routes"
import AeroSupport from "@aero/aero-support"
import { Cache } from "@aero/aero-support/lib/interfaces"

// Load the library
import { version } from "../package.json"
import Application from "./Application"
import Root from "./Root"
import Config from "./Config"
import ENV from "./ENV"
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
	static logger = new AeroSupport.Logger()

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
	 * Low-level cache for your application
	 *
	 * @remarks
	 * Defaults to an in-memory cache implementation
	 *
	 * @example
	 * Use the Redis caching implementation
	 * ```
	 * import Aero from "@aero/aero"
	 * import AeroSupport from "@aero/aero-support"
	 *
	 * Aero.cache = new AeroSupport.Caches.Redis()
	 * ```
	 */
	static cache: Cache = new AeroSupport.Caches.Memory()

	/**
	 * The configuration for your application
	 */
	static config = new Config()

	static configure(callback: (config: Config) => void) {
		callback(this.config)
	}

	/**
	 * The version of Aero being run
	 */
	static version = version

	/**
	 * Initialize your Aero application
	 *
	 * @remarks
	 * Imports applicationPath and instantiates an app, configures, and initializes it.
	 *
	 * @param applicationPath - The path where your Application class can be found
	 */
	static async initialize(applicationPath = "config/Application") {
		try {
			const ApplicationClass = (await import(this.root.join(applicationPath))).default
			this.application = new ApplicationClass()

			Aero.logger.info("Loading Aero configuration")
			// Configure and initialize Aero.Application instance
			this.application.configure(this.config)

			// Load environment specific config
			await import(Aero.root.join("config", "environments", Aero.env.toString()))

			Aero.logger.debug("Initializing Aero.Application instance")
			await this.application.initialize()

			Aero.logger.debug("Initializing database connection")
			await this.application.initDB()

			Aero.logger.debug("Loading locales")
			this.config.i18n({
				directory: Aero.root.join("config/locales"),
				api: {
					"__": "t",
				},
				parser: YAML,
				logDebugFn: Aero.logger.debug,
				logWarnFn: Aero.logger.warn,
				logErrorFn: Aero.logger.error,
			} as ConfigurationOptions)

			Aero.logger.debug("Loading routes")
			AeroWeb.logger = Aero.logger
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

			// Add the welcome page if no routes are registered yet
			if (this.routes.state.length === 0) {
				await this.application.controllers.load(
					`${__dirname}/controllers`,
				)

				await this.application.viewEngine.load(
					`${__dirname}/views`,
				)

				this.routes.addRoute({
					method: "GET",
					path: "/",
					spec: "aero::welcome#index",
					options: {},
				}, "")
			}

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
