import { FastifyReply, FastifyRequest } from "fastify"

export default class Cookie {
	constructor(
    private req: FastifyRequest,
    private res: FastifyReply,
	) {}

	get(key: string) {
		return this.req.cookies[key]
	}

	set(key: string, value: string) {
		this.res.cookie(key, value, { path: "/", httpOnly: true })
	}

	clear(key: string) {
		this.res.clearCookie(key)
	}
}
