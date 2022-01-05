import { FastifyReply, FastifyRequest } from "fastify"

import { ViewEngine } from "./types"
import Parameters from "./Parameters"

export type ControllerConstructor = {
	new(controllerName: string, req: FastifyRequest, res: FastifyReply): Controller
}

export default abstract class Controller {
	static layout = "application"

	controllerName: string
	viewEngine: ViewEngine
	req: FastifyRequest
	res: FastifyReply
	params: Parameters

	protected constructor(controllerName: string, viewEngine: ViewEngine, req: FastifyRequest, res: FastifyReply) {
		this.controllerName = controllerName
		this.viewEngine = viewEngine
		this.req = req
		this.res = res
		this.params = new Parameters(this.req)
	}

	render(templateName: string) {
		const layoutName = (this.constructor as typeof Controller).layout
		const fullTemplateName = `${this.controllerName.replace("_", "/")}/${templateName}`

		this.res.type("text/html")

		return this.viewEngine.render(layoutName, {
			...this.viewLocals,
			yield: this.viewEngine.render(
				fullTemplateName,
				this.viewLocals,
			),
		})
	}

	private get viewLocals() {
		return {
			...this,
		}
	}
}
