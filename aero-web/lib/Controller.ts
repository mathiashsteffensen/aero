import { FastifyReply, FastifyRequest } from "fastify"

import AeroSupport from "@aero/aero-support"
import { HookAction } from "@aero/aero-support/dist/typings/Hooks"

import AeroWeb from "./AeroWeb"
import Hooks from "./Hooks"
import Parameters from "./Parameters"
import { ViewEngine, Public } from "./types"
import RouteBuilder from "./RouteBuilder"
import Cookie from "./Cookie"
import { RouteString } from "./RouteHelpers"

export type ControllerConstructor = {
	new(
		controllerName: string,
		processingAction: string,
		viewEngine: ViewEngine,
		viewHelpers: Record<string, unknown>,
		req: FastifyRequest,
		res: FastifyReply
	): Controller
	mount?: (r: RouteBuilder) => void
}

export default class Controller extends AeroSupport.BasicObject {
	static layout = "application"

	static get controllerName() {
		return AeroSupport.Helpers.toSnakeCase(this.name).split("_controller")[0] || ""
	}

	static beforeAction<TController extends Controller>(hook: HookAction<TController>) {
		Hooks.add(this.controllerName, "before", "action", hook as HookAction<Controller>)
	}

	static afterAction<TController extends Controller>(hook: HookAction<TController>) {
		Hooks.add(this.controllerName, "after", "action", hook as HookAction<Controller>)
	}

	static callHooks<TController extends Controller>(type: "before" | "after", instance: TController) {
		return Hooks.callHooks(instance)(type, "action")
	}

	constructor(
		public controllerName: string,
		public processingAction: string,
		public viewEngine: ViewEngine,
		public viewHelpers: Record<string, unknown>,
		public req: FastifyRequest,
		public res: FastifyReply,
		public params: Public<Parameters> = new Parameters(req),
		public cookie: Public<Cookie> = new Cookie(req, res),
	) {
		super()
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

	isCurrentPage = (path: Public<RouteString>) => {
		return this.req.url === path.path
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
