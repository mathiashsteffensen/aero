import AeroMailer from "../lib/AeroMailer"

class ViewEngine {
	async render(template: string, data: Record<string, unknown>) {
		let compiled = template

		for (const dataKey of Object.keys(data)) {
			compiled = compiled.replace(`{{${dataKey}}}`, data[dataKey] as string)
		}

		return compiled
	}

	async load(dir: string) {
		console.log(dir)
	}
}

AeroMailer.viewEngine = new ViewEngine()
