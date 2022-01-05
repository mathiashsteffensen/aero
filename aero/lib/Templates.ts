import ejs from "ejs"
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
	load(pagesDir: string, layoutsDir: string) {
		this.state.pages = this.loadDir(pagesDir)
		this.state.layouts = this.loadDir(layoutsDir)
	}
}
