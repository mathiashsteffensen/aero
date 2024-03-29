import * as fs from "fs"
import { FastifyReply, FastifyRequest } from "fastify"

import Controller, { ControllerConstructor } from "./Controller"

import { ViewEngine } from "./types"
import Routes from "./Routes"
import AeroWeb from "./AeroWeb"

const toSnakeCase = (s: string) =>
	s[0]?.toLowerCase() + s.slice(1).replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)

export default class Controllers {
	#state: Map<string, ControllerConstructor> = new Map<string, ControllerConstructor>()

	set(name: string, controller: ControllerConstructor) {
		this.#state.set(name, controller)
	}

	get(name: string) {
		return this.#state.get(name)
	}

	// TODO: Clean up this shitty controller parsing - a couple comments wouldn't hurt
	async loadDir(dir: string, controllerNamePrefix = "") {
		for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
			const absPath = `${dir}/${f.name}`

			const importFile = async () => (await import(absPath.split(".")[0] || "")).default

			if (f.isFile()) {
				// Snake case file name and strip '_controller' suffix if exists
				const controllerName = toSnakeCase(f.name).split("_controller")[0] || ""
				if (controllerNamePrefix) {
					this.set(`${controllerNamePrefix}::${controllerName}`, await importFile())
				} else {
					this.set(controllerName, await importFile())
				}
			} else {
				if (controllerNamePrefix) {
					await this.loadDir(absPath, `${controllerNamePrefix}::${f.name}`)
				} else {
					await this.loadDir(absPath, f.name)
				}
			}
		}
	}

	/**
	 * Automatically load controllers from a specified directory of files
	 *
	 * @remarks
	 * This method loads all controller files in a specified directory and does so recursively
	 *
	 * @example
	 * As used in the Aero web framework
	 *
	 * ```
	 * 	await this.controllers.load(
	 * 		aero.root.join("app/controllers"),
	 * 		aero.logger.fatal
	 * 	)
	 * ```
	 *
	 * @param dir - directory to load
	 * @param onError - on error callback function, the default onError function logs the error and throws it again
	 */
	async load(
		dir: string,
		onError: (e: unknown) => void = (e: unknown) => {
			// eslint-disable-next-line no-console
			console.log(e)
			throw e
		},
	) {
		try {
			await this.loadDir(dir)
		} catch(e) {
			onError(e)
		}
	}

	/**
	 * Checks if a controller and action has been loaded
	 *
	 * @param controllerName - the name of the controller
	 * @param action - the method to check the controller for
	 */
	check(controllerName: string, action: string) {
		const ControllerClass = this.#state.get(controllerName)

		if (!ControllerClass) {
			throw new Error(`Controller with name ${controllerName} not found, loaded controllers are ${Object.keys(this.#state)}`)
		}

		const controller = new ControllerClass(
			controllerName,
			action,
			{
				async render() { return "" },
				async load(viewDir: string) {
					// eslint-disable-next-line no-console
					console.log(viewDir)
				},
			},
			{},
			{} as FastifyRequest,
			{} as FastifyReply,
		)

		if (!controller[action as keyof Controller]) {
			throw new Error(`Controller with name ${controllerName} does not have specified action ${action}`)
		}
	}

	/**
	 * Instantiate a new Controller instance, and it's action
	 *
	 * @param controllerName - name of the controller
	 * @param action - the action to check for
	 * @param viewEngine - the engine to use for rendering views
	 * @param viewHelpers - helpers to pass to the template
	 * @param req - the Fastify request object
	 * @param res - the Fastify reply object
	 */
	new(
		controllerName: string,
		action: string,
		viewEngine: ViewEngine,
		viewHelpers: Record<string, unknown>,
		req: FastifyRequest,
		res: FastifyReply,
	): Controller {
		const controller = this.#state.get(controllerName)

		this.check(controllerName, action)

		return new (controller as ControllerConstructor)(controllerName, action, viewEngine, viewHelpers, req, res)
	}

	mount(routes: Routes) {
		routes.draw((r) => {
			for (const [controllerName, controller] of this.#state) {
				if (!controller) continue

				if (typeof controller.mount === "function") {
					AeroWeb.logger.trace(`Mounting ${controllerName} controller`)

					controller.mount(r)
				}
			}
		})
	}
}
