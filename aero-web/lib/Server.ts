import { fastify, FastifyInstance } from "fastify"
import fastifyStatic from "fastify-static"
import pino from "pino"
import cuid from "cuid"

export interface ServerOptions {
  staticDir: string,
  logger: pino.BaseLogger
}

export default class Server {
	logger: pino.BaseLogger
	fastify: FastifyInstance

	constructor(options: ServerOptions) {
		this.logger = options.logger

		this.fastify = fastify({
			logger: options.logger,
			genReqId: cuid,
		})

		this.fastify.register(fastifyStatic, {
			root: options.staticDir,
			prefix: options.staticDir.split("/")[options.staticDir.split("/").length - 1],
		})
	}

	async start() {
		return this.fastify.listen({ port: 8080, host: "0.0.0.0" })
	}
}
