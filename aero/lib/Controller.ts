import Aero from "./Aero"
import { FastifyReply, FastifyRequest } from "fastify"
import ViewHelpers from "./ViewHelpers"
import RouteHelpers from "./RouteHelpers"

export type ControllerConstructor = {
	new(controllerName: string, viewHelpers: ViewHelpers, routes: RouteHelpers, req: FastifyRequest, res: FastifyReply): Controller
}

export default abstract class Controller {
	static layout = "application"

	controllerName: string
	viewHelpers: ViewHelpers
	routes: RouteHelpers
	req: FastifyRequest
	res: FastifyReply

	protected constructor(controllerName: string, viewHelpers: ViewHelpers, routes: RouteHelpers, req: FastifyRequest, res: FastifyReply) {
		this.controllerName = controllerName
		this.viewHelpers = viewHelpers
		this.routes = routes
		this.req = req
		this.res = res
	}

	render(templateName: string) {
		const layoutName = (this.constructor as typeof Controller).layout
		const fullTemplateName = `${this.controllerName.replace("_", "/")}/${templateName}`

		const layout = Aero.application.templates.state.layouts[layoutName]
		if (!layout) {
			throw new Error(`Layout with name with name ${layoutName} couldn't be found, loaded layouts are \n${Object.keys(Aero.application.templates.state.layouts).join("\n")}`)
		}

		const template = Aero.application.templates.state.pages[fullTemplateName]
		if (!template) {
			throw new Error(`Template with name ${fullTemplateName} couldn't be found, loaded templates are \n${Object.keys(Aero.application.templates.state.pages).join("\n")}`)
		}

		this.res.type("text/html")

		return layout({
			...this.viewLocals,
			yield: template(this.viewLocals),
		})
	}

	renderPartial = (path: string) => {
		const templateNames = [
			...Object.keys(Aero.application.templates.state.pages),
			...Object.keys(Aero.application.templates.state.layouts),
		]

		if (!templateNames.includes(path)) {
			throw new Error(`Partial with path ${path} couldn't be found, loaded templates are \n${templateNames.join("\n")}`)
		}

		const layout = Aero.application.templates.state.layouts[path]

		if (layout) {
			return layout(this.viewLocals)
		}

		const template = Aero.application.templates.state.pages[path]

		return template?.(this.viewLocals)
	}

	private get viewLocals() {
		return {
			...this,
			...this.viewHelpers,
			paths: this.routes,
			render: this.renderPartial,
		}
	}
}
