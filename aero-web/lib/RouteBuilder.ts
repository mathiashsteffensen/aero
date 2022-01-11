import pluralize from "pluralize"

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

	/**
	 * Defines a PUT route
	 *
	 * @param path - the path of the PUT route
	 * @param spec - the route specification, controller/action pair
	 * @param options - options for this route
	 */
	put(path: string, spec: RouteSpecification, options: RouteOptions = {}) {
		this.#routes.addRoute({
			method: "PUT",
			path,
			spec,
			options,
		}, this.#scope)
	}

	/**
	 * Defines a DELETE route
	 *
	 * @param path - the path of the DELETE route
	 * @param spec - the route specification, controller/action pair
	 * @param options - options for this route
	 */
	delete(path: string, spec: RouteSpecification, options: RouteOptions = {}) {
		this.#routes.addRoute({
			method: "DELETE",
			path,
			spec,
			options,
		}, this.#scope)
	}

	/**
	 * Registers an application resource
	 *
	 * @param resourceName
	 * @param options
	 */
	resource(resourceName: string, options: RouteOptions = {}) {
		const controllerName = pluralize.plural(resourceName)
		const as = options.as || resourceName

		// Creating a new resource
		this.get(`${resourceName}/new`, `${controllerName}#new`, { as: `new_${as}` })
		this.post(resourceName, `${controllerName}#create`, { as: `new_${as}` })

		// Editing an existing resource
		this.get(`${resourceName}/:id/edit`, `${controllerName}#edit`, { as: `edit_${as}` })
		this.put(resourceName, `${controllerName}#update`, { as: `edit_${as}` })

		// Viewing a resource
		this.get(`${resourceName}/:id`, `${controllerName}#read`, { as })
	}
}
