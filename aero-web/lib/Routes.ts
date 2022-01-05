import Controller from "./Controller"
import RouteHelpers from "./RouteHelpers"
import Controllers from "./Controllers"
import Server from "./Server"

import { RouteHandler, RouteSpecification, RouteState } from "./types"
import RouteBuilder from "./RouteBuilder"

export default class Routes {
	/**
   * @internal
   */
	#controllers: Controllers

	/**
	 * @internal
	 */
	#server: Server

	constructor(controllers: Controllers, server: Server) {
		this.#controllers = controllers
		this.#server = server
	}

	/**
   * @internal
   */
	#state: RouteState = []

	/**
	 * Make urls in controllers and views
	 *
	 * @example
	 * ```
	 * // config/routes.ts
	 *
	 * import Aero from "@aero/aero";
	 *
	 * Aero.routes.draw((r) => {
	 *   r.get("/user/:id", "user#show", { as: "user" })
	 * })
	 * ```
	 *
	 * ```
	 * import Aero from "@aero/aero";
	 *
	 * // In the rest of your application
	 * console.log(Aero.routes.make.user?.({ id: userId }))
	 * ```
	 */
	make!: RouteHelpers

	/**
	 * Draw passes this its own instance of Routes to a callback function to allow you to elegantly define your routes
	 *
	 * @param callback - function that draws the routes
	 *
	 * @example
	 * In the default routes file config/routes.ts
	 * ```
	 * import Aero from "@aero/aero";
	 *
	 * Aero.routes.draw((r) => {
	 *   r.get("/session/new", "session#new")
	 * })
	 * ```
	 */
	draw(callback: (r: RouteBuilder) => void) {
		callback(new RouteBuilder(this))
	}

	/**
	 * Splits route specification into its controller and action parts if it is a string
	 *
	 * @internal
	 */
	private specToControllerAndAction(spec: RouteSpecification): { controller: string, action: string } {
		if (typeof spec === "string") {
			return {
				controller: spec.split("#")[0] || "",
				action: spec.split("#")[1] || "",
			}
		} else if (typeof spec === "function") {
			return {
				controller: "",
				action: "",
			}
		} else {
			return spec
		}
	}

	private specToHandler(spec: RouteSpecification): RouteHandler {
		if (typeof spec === "function") {
			return spec
		} else {
			this.controllerCheck(spec)

			const { controller, action } = this.specToControllerAndAction(spec)

			return async (req, res) => {
				const controllerInstance = this.#controllers.new(controller, req, res)
				const actionResponse = await (controllerInstance[action as keyof Controller] as unknown as () => Promise<unknown>)()

				// If the action didn't provide a response,
				// try to render the template corresponding to the controller and action name
				if (!actionResponse) {
					return controllerInstance.render(action)
				}

				return actionResponse
			}
		}
	}

	/**
	 *	Checks if the specified controller exists
	 *
	 * @internal
	 */
	private controllerCheck(spec: RouteSpecification) {
		const { controller } = this.specToControllerAndAction(spec)

		this.#controllers.check(controller)
	}

	addRoute(route: RouteState[0], scope: string) {
		route.path = scope.endsWith("/") ? scope : `${scope}/${route.path}`

		this.#server.fastify.route(
			{
				method: route.method,
				url: route.path,
				handler: this.specToHandler(route.spec),
			},
		)

		this.#state.push(route)

		this.make = new RouteHelpers(this.#state)
	}
}
