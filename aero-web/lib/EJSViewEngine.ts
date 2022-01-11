import { ViewEngine } from "./types"
import fs from "fs"
import ejs, { TemplateFunction, Data } from "ejs"

export default class EJSViewEngine implements ViewEngine {
	state: Map<string, ejs.TemplateFunction> = new Map<string, TemplateFunction>()

	loadDir(dir: string, namePrefix = "") {
		let templates = new Map<string, TemplateFunction>()

		for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
			const fullPath = `${dir}/${f.name}`
			const fileName = f.name.split(".")[0] || ""
			const templateName = namePrefix ? `${namePrefix}/${fileName}` : fileName

			if (f.isDirectory()) {
				templates = new Map<string, TemplateFunction>([
					...templates,
					...this.loadDir(fullPath, templateName),
				])
			} else {
				const template = ejs.compile(
					fs.readFileSync(fullPath).toString(),
					{
						cache: true,
						filename: templateName,
					},
				)

				templates.set(templateName, template)
			}
		}

		return templates
	}

	load(viewDir: string) {
		this.state = this.loadDir(viewDir)
	}

	render(viewPath: string, data: Data | undefined = undefined): string {
		const template = this.state.get(viewPath)

		if (!template) {
			throw new Error(`Couldn't find template with path ${viewPath}, available templates are: ${[...this.state.keys()].join("\n")}`)
		}

		return template(data)
	}
}
