import { BaseLogger } from "pino"

import AeroWeb, { Server } from "@aero/aero-web"

import Config from "./Config"
import ENV from "./ENV"
import Aero from "./Aero"
import Templates from "./Templates"
import AssetPipeline, { IAssetPipeline } from "./AssetPipeline"
import ViewHelpers from "./ViewHelpers"
import Root from "./Root"


export interface IApplication {
	configure: (config: Config) => void
	initialize: (aero: typeof Aero) => void
	start: (version: string) => void
}

export default abstract class Application implements IApplication {
	config: Config
	env = new ENV()
	root: Root
	logger: BaseLogger
	templates = new Templates()
	assetPipeline: IAssetPipeline = new AssetPipeline()
	controllers = new AeroWeb.Controllers()
	viewHelpers!: ViewHelpers
	server: Server

	protected constructor(aero: typeof Aero) {
		this.config = aero.config
		this.root = aero.root
		this.logger = aero.logger

		this.server = new AeroWeb.Server({
			logger: this.logger,
			staticDir: this.root.join("public"),
		})
	}

	/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */
	configure(_config: Config) {}
	/* eslint-enable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

	async initialize(aero: typeof Aero) {
		await this.controllers.load(
			this.root.join("app/controllers"),
			this.logger.fatal,
		)

		this.templates.load(
			this.root.join(this.config.viewDir, "pages"),
			this.root.join(this.config.viewDir, "layouts"),
		)

		this.assetPipeline.compile(aero).then(() => {
			this.logger.info("Frontend assets compiled ...")
			this.viewHelpers = new ViewHelpers(this.assetPipeline.assetManifest)
		})
	}

	async start(version: string) {
		this.logger.info("Starting Aero application")
		this.logger.info("Environment: %s", this.env.toString())
		this.logger.info("Version: %s", version)

		return this.server.start()
	}
}
