import pluralize from "pluralize"

import Routes from "./Routes"
import { RouteOptions, RouteSpecification } from "./types"

interface ResourceOptions {
	except?: Array<"new" | "edit" | "create" | "update" | "show" | "index">
}

export default class RouteBuilder {
	readonly #routes: Routes
	readonly #scope: string

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
	 * Alias for namespace
	 */
	scope = this.namespace

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
	 */
	resource(resourceName: string, options: RouteOptions & ResourceOptions = {}) {
		const controllerName = pluralize.plural(resourceName)
		const as = options.as || resourceName

		// Creating a new resource
		if (!options.except?.includes("new")) {
			this.get(`${resourceName}/new`, `${controllerName}#new`, { as: `new_${as}` })
		}
		if (!options.except?.includes("create")) {
			this.post(resourceName, `${controllerName}#create`, { as })
		}

		// Editing an existing resource
		if (!options.except?.includes("edit")) {
			this.get(`${resourceName}/:id/edit`, `${controllerName}#edit`, { as: `edit_${as}` })
		}
		if (!options.except?.includes("update")) {
			this.put(`${resourceName}/:id`, `${controllerName}#update`, { as })
		}

		// Viewing a resource
		this.get(`${resourceName}/:id`, `${controllerName}#show`, { as })
	}

	/**
	 * Registers an application resource
	 */
	resources(resourceName: string, options: RouteOptions & ResourceOptions = {}) {
		const clonedOptions = Object.assign({}, options)

		clonedOptions.as ||= pluralize.singular(resourceName)

		// Register the singular resource routes
		this.resource(resourceName, clonedOptions)

		// Register the index route
		if (!options.except?.includes("index")) {
			this.get(resourceName, `${resourceName}#index`)
		}
	}
}
