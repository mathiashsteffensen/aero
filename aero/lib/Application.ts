import { fastify, FastifyInstance } from "fastify"
import fastifyStatic from "fastify-static"
import cuid from "cuid"

import Config from "./Config"
import ENV from "./ENV"
import Controllers from "./Controllers"
import Aero from "./Aero"
import Templates from "./Templates"
import AssetPipeline, { IAssetPipeline } from "./AssetPipeline"
import ViewHelpers from "./ViewHelpers"

export default abstract class Application {
	env = new ENV()
	templates = new Templates()
	assetPipeline: IAssetPipeline = new AssetPipeline()
	controllers = new Controllers()
	viewHelpers!: ViewHelpers
	fastify: FastifyInstance

	protected constructor(aero: typeof Aero) {
		this.fastify = fastify({
			logger: aero.logger,
			genReqId: cuid,
		})

		this.fastify.register(fastifyStatic, {
			root: aero.root.join("public"),
			prefix: "/public/",
		})
	}

	configure(config: Config) {
		config.loadDefaults()
	}

	async initialize(aero: typeof Aero) {
		await this.controllers.load(aero)
		this.templates.load(aero)
		this.assetPipeline.compile(aero).then(() => {
			this.fastify.log.info("Frontend assets compiled ...")
			this.viewHelpers = new ViewHelpers(this.assetPipeline.assetManifest)
		})
	}

	async start(version: string) {
		this.fastify.log.info("Starting Aero application")
		this.fastify.log.info("Environment: %s", this.env.toString())
		this.fastify.log.info("Version: %s", version)

		return this.fastify.listen({ port: 8080, host: "0.0.0.0" })
	}
}
