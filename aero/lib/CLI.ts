import fs from "fs/promises"
import { exec as baseExec } from "child_process"

const exec = (command: string) => {
	const cmd = baseExec(command)

	cmd.stdout?.pipe(process.stdout)
	cmd.stderr?.pipe(process.stderr)
}

import { Command } from "commander"

import Aero from "./Aero"

const program = new Command()

program.version(Aero.version, "-v, --version")

export default class CLI {
	constructor() {
		program
			.command("s")
			.description("Start the Aero server")
			.action(this.serve)

		program
			.command("new")
			.description("Generate a new Aero application")
			.argument("<name>", "Name of your application")
			.action(this.new)
	}

	run() {
		program.parse()
	}

	async new(name: string) {
		// Base dir
		await fs.mkdir(name)

		// App dir
		await fs.mkdir(`${name}/app`)

		// Assets
		await fs.mkdir(`${name}/app/assets`)
		await fs.mkdir(`${name}/app/assets/scripts`)
		await fs.mkdir(`${name}/app/assets/styles`)
		await fs.writeFile(`${name}/app/assets/scripts/application.ts`, "")
		await fs.writeFile(`${name}/app/assets/styles/application.scss`, "")

		// Controllers
		await fs.mkdir(`${name}/app/controllers`)
		await fs.writeFile(`${name}/app/controllers/BaseController.ts`, BaseController)

		// Models
		await fs.mkdir(`${name}/app/models`)
		await fs.writeFile(`${name}/app/models/BaseRecord.ts`, BaseRecord)

		// Views
		await fs.mkdir(`${name}/app/views`)
		await fs.mkdir(`${name}/app/views/layouts`)
		await fs.mkdir(`${name}/app/views/pages`)
		await fs.writeFile(`${name}/app/views/layouts/application.html.ejs`, Layout(name))

		// Workers
		await fs.mkdir(`${name}/app/workers`)

		// Config dir
		await fs.mkdir(`${name}/config`)
		await fs.writeFile(`${name}/config/Application.ts`, Application)
		await fs.writeFile(`${name}/config/routes.ts`, Routes)
		await fs.writeFile(`${name}/config/database.yml`, Database(name))
	}

	serve() {
		exec(`./node_modules/.bin/pm2 start config/process.${Aero.env.toString()}.config.js --no-daemon`)
	}
}

const BaseController = `import AeroWeb from "@aero/aero-web";

export class BaseController extends AeroWeb.Controller {}
`

const BaseRecord = `import cuid from "cuid"

import AeroRecord from "@aero/aero-record";

export abstract class BaseRecord<TRecord extends BaseRecord<TRecord>> extends AeroRecord.Base<TRecord> {
  id: string
  createdAt?: Date
  updatedAt?: Date

  @AeroRecord.Decorators.before("create")
  setId() {
    this.id = cuid()
  }
}
`

const Layout = (name: string) => `<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport"
        content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>${name}</title>
  <%- localStyleTag("application") %>
</head>
<body>
  <div class="container d-flex justify-content-center my-3">
    <%- yield %>
  </div>
  <%- localScriptTag("application") %>
</body>
</html>
`

const Application = `import Aero from "@aero/aero"

export default class Application extends Aero.Application {}
`

const Routes = `import Aero from "@aero/aero"

Aero.routes.draw((r) => {
  
})
`

const Database = (name: string) => `development:
  client: pg
  connection:
    host: 127.0.0.1
    port: 5432
    user: postgres
    password: postgres
    database: ${name.replaceAll("-", "_")}_development

test:
  client: pg
  connection:
    host: 127.0.0.1
    port: 5432
    user: postgres
    password: postgres
    database: ${name.replaceAll("-", "_")}_test
`
