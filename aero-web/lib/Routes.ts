import Controller from "./Controller"
import Controllers from "./Controllers"
import * as Errors from "./Errors"
import RouteBuilder from "./RouteBuilder"
import RouteHelpers from "./RouteHelpers"
import Server from "./Server"

import { RouteHandler, RouteSpecification, RouteState, ViewEngine } from "./types"
import AeroWeb from "./AeroWeb"

export default class Routes {
	/**
   * @internal
   */
	readonly #controllers: Controllers

	/**
	 * @internal
	 */
	readonly #server: Server

	/**
	 * @internal
	 */
	readonly #viewEngine: ViewEngine

	/**
	 * @internal
	 */
	readonly #viewHelpers: Record<string, unknown>

	constructor(
		controllers: Controllers,
		server: Server,
		viewEngine: ViewEngine,
		viewHelpers: Record<string, unknown>,
	) {
		this.#controllers = controllers
		this.#server = server
		this.#viewEngine = viewEngine
		this.#viewHelpers = viewHelpers
	}

	/**
   * @internal
   */
	#state: RouteState = []

	get state() {
		return this.#state
	}

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
				AeroWeb.logger.debug(
					`${req.method.toUpperCase()} ${req.url} being processed by ${controller[0]?.toUpperCase() + controller.slice(1)}Controller#${action}`,
				)

				const ControllerClass = this.#controllers.get(controller) as typeof Controller

				const controllerInstance = this.#controllers.new(
					controller,
					action,
					this.#viewEngine,
					{
						...this.#viewHelpers,
						paths: this.make,
					},
					req,
					res,
				)

				// Call before action hooks
				await ControllerClass.callHooks("before", controllerInstance, action)

				const actionResponse = await (controllerInstance[action as keyof Controller] as (params: unknown) => unknown | ((params: unknown) => Promise<unknown>))(req.params)

				// Call after action hooks
				await ControllerClass.callHooks("after", controllerInstance, action)

				// If the action didn't provide a response,
				// try to render the template corresponding to the controller and action name
				if (!actionResponse && !res.sent) {
					return await controllerInstance.render(action)
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
		const { controller, action } = this.specToControllerAndAction(spec)

		this.#controllers.check(controller, action)
	}

	addRoute(route: RouteState[0], scope: string) {
		if (route.path.startsWith("/")) {
			route.path = route.path.slice(1, route.path.length)
		}

		route.path = scope.endsWith("/") ? scope + route.path : `${scope}/${route.path}`

		// Fastify requires routes to start with '/' or '*'
		if (!route.path.startsWith("/") && !route.path.startsWith("*")) {
			route.path = `/${route.path}`
		}

		try {
			this.#server.fastify.route(
				{
					method: route.method,
					url: route.path,
					handler: this.specToHandler(route.spec),
				},
			)

		} catch (e) {
			throw new Errors.RouteError(route, e)
		}

		this.#state.push(route)

		this.make = new RouteHelpers(this.#state)
	}
}
