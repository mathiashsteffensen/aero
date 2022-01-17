import { BaseLogger } from "pino"

import AeroWeb, { Server } from "@aero/aero-web"
import { ViewEngine } from "@aero/aero-web/dist/typings/types"
import AeroRecord from "@aero/aero-record"

import Config from "./Config"
import ENV from "./ENV"
import Aero from "./Aero"
import AssetPipeline, { IAssetPipeline } from "./AssetPipeline"
import ViewHelpers from "./ViewHelpers"
import Root from "./Root"

export interface IApplication {
	configure: (config: Config) => void
	initialize: (aero: typeof Aero) => void
	start: (version: string) => void
}

/**
 * Application class that yours should inherit from
 *
 * @example
 * Your Application file should be located at config/Application.ts from the root of your project
 * ```
 * import Aero from "@aero/aero"
 *
 * export default class Application extends Aero.Application {}
 * ```
 *
 * With no custom configuration, this is all that is needed to create an Aero application
 */
export default abstract class Application implements IApplication {
	config: Config
	env = new ENV()
	root: Root
	logger: BaseLogger
	viewEngine: ViewEngine = new AeroWeb.ViewEngines.EJS()
	assetPipeline: IAssetPipeline = new AssetPipeline()
	controllers = new AeroWeb.Controllers()
	viewHelpers!: ViewHelpers
	server!: Server

	protected constructor(aero: typeof Aero) {
		this.config = aero.config
		this.root = aero.root
		this.logger = aero.logger
	}

	/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */
	/**
	 * Configure your application with this method
	 *
	 * @remarks
	 * This is the first method called when loading your application file
	 *
	 * @example
	 * ```
	 * import Aero from "@aero/aero"
	 * import AeroSupport from "@aero/aero-support"
	 *
	 * export default class Application extends Aero.Application {
	 *   configure(config) {
	 *     config.logLevel = "debug"
	 *     config.cache = new AeroSupport.Caches.Redis()
	 *   }
	 * }
	 * ```
	 */
	configure(_config: Config) {}
	/* eslint-enable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

	/**
	 * Initializes your application
	 *
	 * @remarks
	 * If you want to customize this method,
	 * it is important to call super to ensure the application is initialized properly
	 *
	 * @example
	 * ```
	 * import Aero from "@aero/aero"
	 *
	 * export default class Application extends Aero.Application {
	 *		async initialize(aero) {
	 *			await super.initialize(aero)
	 *
	 * 			// Flush cache before initializing
	 *     	await this.config.cache.flush()
	 *		}
	 * }
	 * ```
	 */
	async initialize(aero: typeof Aero) {
		await import(aero.root.join("config", "environments", aero.env.toString()))

		this.server = new AeroWeb.Server({
			logger: this.logger,
			staticDir: this.root.join(this.config.staticDir),
			staticDirPathPrefix: `/${this.config.staticDir}/`,
		})

		await this.controllers.load(
			this.root.join("app/controllers"),
			this.logger.fatal,
		)

		await this.viewEngine.load(
			this.root.join(this.config.viewDir),
		)

		await this.assetPipeline.compile(aero).then(() => {
			this.logger.info("Frontend assets compiled ...")
			this.viewHelpers = new ViewHelpers(this.assetPipeline.assetManifest)
		})
	}

	/**
	 * Initializes your database connection
	 *
	 * @remarks
	 * By default, this establishes a connection using AeroRecord. If you are using a different ORM, override this method
	 *
	 * @example
	 * Using a different ORM:
	 * ```
	 * import { Sequelize } from "sequelize"
	 * const sequelize = new Sequelize('sqlite::memory:')
	 *
	 * export default class Application extends Aero.Application {
	 * 		async initDB() {
	 * 			await sequelize.sync()
	 * 		}
	 * }
	 * ```
	 */
	async initDB() {
		AeroRecord.logger = this.logger
		AeroRecord.establishConnection(
			this.env.toString(),
			this.root.join(this.config.databaseFile),
		)
	}

	start(version: string) {
		this.logger.info("Starting Aero application")
		this.logger.info("Environment: %s", this.env.toString())
		this.logger.info("Version: %s", version)

		return this.server.start()
	}
}
