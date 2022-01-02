import * as fs from "fs"

import Aero from "./Aero"
import Controller, { ControllerConstructor } from "./Controller"
import { FastifyReply, FastifyRequest } from "fastify"
import ViewHelpers from "./ViewHelpers"
import RouteHelpers from "./RouteHelpers"

const toSnakeCase = (s: string) =>
	s[0]?.toLowerCase() + s.slice(1).replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)

export default class Controllers {
	#state: Record<string, ControllerConstructor> = {}

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

	async load(aero: typeof Aero) {
		try {
			await this.loadDir(aero.root.join("app/controllers"))
		} catch(e) {
			aero.logger.error(e)
			throw e
		}
	}

	check(controllerName: string) {
		const controller = this.#state[controllerName]

		if (!controller) {
			throw new Error(`Controller with name ${controllerName} not found, loaded controllers are \n${Object.keys(this.#state).join("\n")}`)
		}
	}

	new(controllerName: string, viewHelpers: ViewHelpers, routes: RouteHelpers, req: FastifyRequest, res: FastifyReply): Controller {
		const controller = this.#state[controllerName]

		this.check(controllerName)

		return new (controller as ControllerConstructor)(controllerName, viewHelpers, routes, req, res)
	}
}
