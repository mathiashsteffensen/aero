import * as fs from "fs"

import Controller, { ControllerConstructor } from "./Controller"
import { FastifyReply, FastifyRequest } from "fastify"

const toSnakeCase = (s: string) =>
	s[0]?.toLowerCase() + s.slice(1).replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)

export default class Controllers {
	#state: Record<string, ControllerConstructor> = {}

	// TODO: Clean up this shitty controller parsing - a couple comments wouldn't hurt
	async loadDir(dir: string, controllerNamePrefix = "") {
		for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
			const absPath = `${dir}/${f.name}`

			const importFile = async () => (await import(absPath.split(".")[0] || "")).default

			if (f.isFile()) {
				const controllerName = toSnakeCase(f.name).split("_controller")[0] || ""
				if (controllerNamePrefix) {
					this.#state[`${controllerNamePrefix}_${controllerName}`] = await importFile()
				} else {
					this.#state[controllerName] = await importFile()
				}
			} else {
				if (controllerNamePrefix) {
					await this.loadDir(absPath, `${controllerNamePrefix}_${f.name}`)
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
	 * Checks if a controller has been loaded
	 *
	 * @param controllerName - the name of the controller
	 */
	check(controllerName: string) {
		const controller = this.#state[controllerName]

		if (!controller) {
			throw new Error(`Controller with name ${controllerName} not found, loaded controllers are \n${Object.keys(this.#state).join("\n")}`)
		}
	}

	/**
	 * Instantiate a new Controller instance
	 *
	 * @param controllerName - name of the controller
	 * @param req - the Fastify request object
	 * @param res - the Fastify reply object
	 */
	new(controllerName: string, req: FastifyRequest, res: FastifyReply): Controller {
		const controller = this.#state[controllerName]

		this.check(controllerName)

		return new (controller as ControllerConstructor)(controllerName, req, res)
	}
}
