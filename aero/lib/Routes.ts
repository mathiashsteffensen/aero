import Application from "./Application"
import { RouteOptions, RouteSpecification, RouteState } from "./types"
import Controller from "./Controller"
import RouteHelpers from "./RouteHelpers"

export default class Routes {
	/**
   * @internal
   */
	#application: Application
	constructor(application: Application) {
		this.#application = application
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
	draw(callback: (r: Routes) => void) {
		callback(this)
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
		} else {
			return spec
		}
	}

	/**
	 *	Checks if the specified controller exists
	 *
	 * @internal
	 */
	private controllerCheck(spec: RouteSpecification) {
		const { controller } = this.specToControllerAndAction(spec)

		this.#application.controllers.check(controller)
	}

	private addRoute(route: RouteState[0]) {
		this.controllerCheck(route.spec)

		const { controller, action } = this.specToControllerAndAction(route.spec)

		this.#application.fastify.route(
			{
				method: route.method,
				url: route.path,
				handler: async (req, res) => {
					const controllerInstance = this.#application.controllers.new(controller, this.#application.viewHelpers, this.make, req, res)
					const actionResponse = await (controllerInstance[action as keyof Controller] as unknown as () => Promise<unknown>)()

					// If the action didn't provide a response,
					// try to render the template corresponding to the controller and action name
					if (!actionResponse) {
						return controllerInstance.render(action)
					}

					return actionResponse
				},
			},
		)

		this.#state.push(route)

		this.make = new RouteHelpers(this.#state)
	}

	/**
	 * Defines a GET route
	 *
	 * @param path - the path of the GET route
	 * @param spec - the route specification, controller/action pair
	 * @param options - options for this route
	 */
	get(path: string, spec: RouteSpecification, options: RouteOptions = {}) {
		this.addRoute({
			method: "GET",
			path,
			spec,
			options,
		})
	}
}
