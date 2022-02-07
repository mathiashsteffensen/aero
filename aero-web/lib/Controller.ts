import { FastifyReply, FastifyRequest } from "fastify"

import AeroSupport from "@aero/aero-support"

import Parameters from "./Parameters"
import Hooks, { Hook } from "./Hooks"
import { ViewEngine, Public } from "./types"
import AeroWeb from "./AeroWeb"
import RouteBuilder from "./RouteBuilder"

export type ControllerConstructor = {
	new(
		controllerName: string,
		viewEngine: ViewEngine,
		viewHelpers: Record<string, unknown>,
		req: FastifyRequest,
		res: FastifyReply
	): Controller
	mount?: (r: RouteBuilder) => void
}

export default class Controller {
	static layout = "application"

	static _controllerName: string

	static set controllerName(newName) {
		this._controllerName = newName
	}
	static get controllerName() {
		return this._controllerName ||= AeroSupport.Helpers.toSnakeCase(this.name).split("_controller")[0] || ""
	}

	static beforeAction<TController extends Controller>(hook: Hook<TController>) {
		this._hooks.addHook("before", hook)
		return undefined
	}

	static afterAction<TController extends Controller>(hook: Hook<TController>) {
		this._hooks.addHook("after", hook)
		return undefined
	}

	static callHooks<TController extends Controller>(type: "before" | "after", instance: TController, controllerAction: string) {
		return this._hooks.call(type, instance, controllerAction)
	}

	static _hooks = new Hooks<any>()

	controllerName: string
	viewEngine: ViewEngine
	viewHelpers: Record<string, unknown>
	req: FastifyRequest
	res: FastifyReply
	params: Public<Parameters>

	constructor(
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
		const layoutName = `layouts/${(this.constructor as typeof Controller).layout}`
		const pageName = `pages/${this.controllerName.replace("::", "/")}/${templateName}`

		this.res.type("text/html")

		return await this.viewEngine.render(layoutName, {
			...this.viewLocals,
			yield: await this.viewEngine.render(
				pageName,
				this.viewLocals,
			),
		})
	}

	renderPartial = (partialName: string, data: Record<string, unknown>) => {
		let templateName: string

		// Handle absolute path
		if (partialName.startsWith("/")) {
			templateName = partialName.slice(1) // Just strip the prefixed /
		} else {
			templateName = `pages/${this.controllerName.replace("::", "/")}/partials/${partialName}`
		}

		return this.viewEngine.render(templateName, {
			...this.viewLocals,
			...data,
		})
	}

	redirectTo(url: string, code = 303) {
		this.res.code(code)
		this.res.header("location", url)
		this.res.send()
	}

	get logger() {
		return AeroWeb.logger.bind({
			reqId: this.req.id,
		})
	}

	get session() { return this.req.session }

	get status() { return this.res.status }

	get viewLocals() {
		return {
			...this,
			...this.viewHelpers,
		}
	}
}
