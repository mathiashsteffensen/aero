import Routes from "./Routes"
import { RouteOptions, RouteSpecification } from "./types"

export default class RouteBuilder {
	#routes: Routes
	#scope: string

	constructor(routes: Routes, scope = "") {
		this.#routes = routes
		this.#scope = scope
	}

	/**
   * Defines a namespace for subsequent routes
   *
   * @example
   * ```
   * Aero.routes.draw((r) => {
   *   r.namespace("admin", (r) => {
   *     // /admin/users
   *     r.get("users")
   *   })
   * })
   * ```
   */
	namespace(scope: string, callback: (r: RouteBuilder) => void) {
		return callback(
			new RouteBuilder(
				this.#routes,
				this.#scope.endsWith("/") ? this.#scope : `${this.#scope}/${scope}`,
			),
		)
	}

	/**
   * Defines a GET route
   *
   * @param path - the path of the GET route
   * @param spec - the route specification, controller/action pair
   * @param options - options for this route
   */
	get(path: string, spec: RouteSpecification, options: RouteOptions = {}) {
		this.#routes.addRoute({
			method: "GET",
			path,
			spec,
			options,
		}, this.#scope)
	}

	/**
	 * Defines a POST route
	 *
	 * @param path - the path of the POST route
	 * @param spec - the route specification, controller/action pair
	 * @param options - options for this route
	 */
	post(path: string, spec: RouteSpecification, options: RouteOptions = {}) {
		this.#routes.addRoute({
			method: "POST",
			path,
			spec,
			options,
		}, this.#scope)
	}

	delete(path: string, spec: RouteSpecification, options: RouteOptions = {}) {
		this.#routes.addRoute({
			method: "DELETE",
			path,
			spec,
			options,
		}, this.#scope)
	}
}
