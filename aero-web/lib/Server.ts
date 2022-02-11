import { fastify, FastifyInstance } from "fastify"
import fastifyStatic from "fastify-static"
import fastifyFormBody from "fastify-formbody"
import fastifySecureSession from "fastify-secure-session"
import qs from "qs"
import pino from "pino"
import cuid from "cuid"
import AeroWeb from "./AeroWeb"
import fs from "fs"

declare module "fastify" {
	interface FastifyRequest {
		startAt: number
	}
}

export interface ServerOptions {
  staticDir: string
	staticDirPathPrefix: string
  logger: pino.BaseLogger
}

export default class Server {
	logger: pino.BaseLogger
	fastify: FastifyInstance

	constructor(options: ServerOptions) {
		this.logger = options.logger

		this.fastify = fastify({
			logger: false,
			disableRequestLogging: true,
			genReqId: cuid,
		})

		this.fastify.register(fastifyStatic, {
			root: options.staticDir,
			prefix: options.staticDirPathPrefix,
		})

		this.fastify.register(fastifyFormBody, { parser: qs.parse })

		this.fastify.register(fastifySecureSession, {
			key: fs.readFileSync(AeroWeb.config.secretKeyFile),
		})

		// Add request logging
		this.fastify.addHook("onRequest", (request, _reply, done) => {
			this.logger.debug(`Started ${request.method.toUpperCase()} for ${request.url}`)

			request.startAt = Date.now()
			done()
		})
		this.fastify.addHook("onResponse", (request, reply, done) => {
			const timeTaken = Date.now() - request.startAt

			this.logger.info({
				reqId: request.id,
				ms: timeTaken,
				method: request.method,
				path: request.url,
				status: reply.statusCode,
			})
			done()
		})

		// Add error logging
		this.fastify.addHook("onError", (request, reply, err, done) => {
			const timeTaken = Date.now() - request.startAt

			this.logger.info({
				reqId: request.id,
				ms: timeTaken,
				method: request.method,
				path: request.url,
				status: reply.statusCode,
				error: err,
			})
			done()
		})
	}

	async start() {
		return this.fastify.listen({
			port: AeroWeb.config.port,
			host: AeroWeb.config.host,
		})
	}
}
