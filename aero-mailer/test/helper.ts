import AeroMailer from "../lib/AeroMailer"

class ViewEngine {
	async render(template: string, data: Record<string, unknown>) {
		let compiled = template

		for (const dataKey of Object.keys(data)) {
			compiled = compiled.replace(`{{${dataKey}}}`, data[dataKey] as string)
		}

		return compiled
	}

	// eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
	async load(_dir: string) {}
}

AeroMailer.viewEngine = new ViewEngine()
