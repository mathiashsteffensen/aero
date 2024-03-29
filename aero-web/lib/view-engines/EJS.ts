import fs from "fs/promises"
import ejs, { Data, AsyncTemplateFunction } from "ejs"

import AeroSupport from "@aero/aero-support"

import { ViewEngine } from "../types"
import AeroWeb from "../AeroWeb"

export class EJS implements ViewEngine {
	state = new Map<string, AsyncTemplateFunction>()

	async load(viewDir: string) {
		const files = (new AeroSupport.FileLoader(viewDir)).load().files

		for (const file of files) {
			const templateName = <string>file.substring(0, file.lastIndexOf(".html.ejs")).split(viewDir)[1]
			const template = ejs.compile(
				(await fs.readFile(file)).toString(),
				{
					cache: true,
					async: true,
					filename: templateName,
				},
			)

			this.state.set(templateName.startsWith("/") ? templateName.slice(1): templateName, template)
		}
	}

	async render(viewPath: string, data: Data | undefined = undefined) {
		const template = this.state.get(viewPath)

		if (!template) {
			throw new Error(`Couldn't find template with path ${viewPath}, available templates are: ${[...this.state.keys()].join("\n")}`)
		}

		const start = Date.now()

		const result = await template(data)

		AeroWeb.logger.debug(
			`Rendered template ${viewPath} in ${Date.now() - start}ms`,
		)

		return result
	}
}
