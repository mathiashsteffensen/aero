import { FastifyReply, FastifyRequest } from "fastify"

import { ViewEngine } from "./types"
import Parameters from "./Parameters"

export type ControllerConstructor = {
	new(
		controllerName: string,
		viewEngine: ViewEngine,
		viewHelpers: Record<string, unknown>,
		req: FastifyRequest,
		res: FastifyReply
	): Controller
}

export default abstract class Controller {
	static layout = "application"

	controllerName: string
	viewEngine: ViewEngine
	viewHelpers: Record<string, unknown>
	req: FastifyRequest
	res: FastifyReply
	params: Parameters

	protected constructor(
		controllerName: string,
		viewEngine: ViewEngine,
		viewHelpers: Record<string, unknown>,
		req: FastifyRequest,
		res: FastifyReply,
	) {
		this.controllerName = controllerName
		this.viewEngine = viewEngine
		this.viewHelpers = viewHelpers
		this.req = req
		this.res = res
		this.params = new Parameters(this.req)
	}

	async render(templateName: string) {
		const layoutName = `/layouts/${(this.constructor as typeof Controller).layout}`
		const pageName = `/pages/${this.controllerName.replace("_", "/")}/${templateName}`

		this.res.type("text/html")

		return await this.viewEngine.render(layoutName, {
			...this.viewLocals,
			yield: await this.viewEngine.render(
				pageName,
				this.viewLocals,
			),
		})
	}

	get viewLocals() {
		return {
			...this,
			...this.viewHelpers,
		}
	}
}
