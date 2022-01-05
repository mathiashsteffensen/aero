import fs from "fs"
import path from "path"

import "jake"
import ejs from "ejs"

// Make sure tasks exits, see https://github.com/jakejs/jake/issues/271
jake.addListener("complete", () => {
	setTimeout(process.exit, 20)
})

const sh = (cmd: string) => new Promise(resolve => jake.exec([cmd], () => resolve(undefined)))

const readTemplate = (template: string) => fs.readFileSync(path.join(__dirname, `templates/${template}.ejs`)).toString()

const renderTemplate = async (template: string, data: Record<string, string>, filePath: string) => {
	const content = ejs.render(readTemplate(template), data)

	await sh(`echo '${content}' >> ${filePath}`)
}

// Add generator tasks
namespace("g", () => {
	desc("Generates a new controller file")
	task("controller", async (controllerName: string) => {
		if (!controllerName) {
			throw "Please provide a controller name, example: jake g:controller[Auth]"
		}

		const filePath = `./app/controllers/${controllerName}Controller.ts`

		await renderTemplate("controller", { name: controllerName }, filePath)

		console.log(`Generated new controller file at ${filePath}`)
	})
})
