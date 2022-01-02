import ejs from "ejs"
import Aero from "./Aero"
import * as fs from "fs"

/**
 *
 * @internal
 */
export default class Templates {
	state: Record<
    "layouts" | "pages",
    Record<string, ejs.TemplateFunction>
  > = {
			layouts: {},
			pages: {},
		}

	loadDir(dir: string, namePrefix = "") {
		let templates: Record<string, ejs.TemplateFunction> = {}

		for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
			const fullPath = `${dir}/${f.name}`
			const fileName = f.name.split(".")[0] || ""
			const templateName = namePrefix ? `${namePrefix}/${fileName}` : fileName

			if (f.isDirectory()) {
				templates = {
					...templates,
					...this.loadDir(fullPath, templateName),
				}
			} else {
				templates[templateName] = ejs.compile(
					fs.readFileSync(fullPath).toString(),
					{
						cache: true,
						filename: templateName,
					},
				)
			}
		}

		return templates
	}

	// viewDir is a parameter so that it can be made into a customization option easily later
	load(aero: typeof Aero, viewDir = "app/views") {
		this.state.pages = this.loadDir(aero.root.join(viewDir, "pages"))
		this.state.layouts = this.loadDir(aero.root.join(viewDir, "layouts"))
	}
}
