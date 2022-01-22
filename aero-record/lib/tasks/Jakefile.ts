import fs from "fs"
import path from "path"

import "jake"
import ejs from "ejs"
import { Knex } from "knex"

import MigrationExecutor from "../MigrationExecutor"
import Connection from "../Connection"

// Make sure tasks exits, see https://github.com/jakejs/jake/issues/271
jake.addListener("complete", () => {
	setTimeout(process.exit, 20)
})

const Task = (name: string) => (jake.Task[name as keyof typeof jake.Task] as { invoke: (...args: Array<unknown>) => void })

const sh = (cmd: string) => new Promise(resolve => jake.exec([cmd], () => resolve(undefined)))

const readTemplate = (template: string) => fs.readFileSync(path.join(__dirname, `templates/${template}.ejs`)).toString()

const renderTemplate = async (template: string, data: Record<string, string>, filePath: string) => {
	const content = ejs.render(readTemplate(template), data)

	await sh(`echo '${content}' >> ${filePath}`)
}

// Add generator tasks
namespace("g", () => {
	desc("Generates a new migration file")
	task("migration", async (migrationName: string) => {
		if (!migrationName) {
			throw "Please provide a migration name, example: jake g:migration[AddUsersTable]"
		}

		const filePath = `./db/migrations/${Date.now()}_${migrationName}.js`

		await renderTemplate("migration", { name: migrationName }, filePath)

		console.log(`Generated new migration file at ${filePath}`)
	})

	desc("Generates a new model file")
	task("model", async (modelName: string) => {
		if (!modelName) {
			throw "Please provide a model name, example: jake g:model[User]"
		}

		const filePath = `./app/models/${modelName}.ts`

		await renderTemplate("model", { name: modelName }, filePath)

		await sh(`echo 'export * from "./${modelName}"' >> ./app/models/index.ts`)

		console.log(`Generated new model file at ${modelName} and exported it from ./app/models`)
	})
})

namespace("db", () => {
	desc("Run all pending migrations")
	task("migrate", async (migrationDir = "./db/migrations", configFile = "./config/database.yml") => {
		const executor = new MigrationExecutor(migrationDir, configFile)

		await executor.printCurrentMigrationVersion()

		const migrations = await executor.migrationsToRun()

		if (migrations.length == 0) {
			console.log("No migrations to run")
			return
		}

		for (const migration of migrations) {
			console.log(`Running migration ${executor.migrationName(migration)}`)
			await executor.up()
		}
	})

	desc("Rollback one migration")
	task("rollback", async (migrationDir = "./db/migrations", configFile = "./config/database.yml") => {
		const executor = new MigrationExecutor(migrationDir, configFile)

		await executor.printCurrentMigrationVersion()

		if ((await executor.migrationStatus()) === 0) {
			console.log("No migrations to roll back")
			return
		}

		console.log("Rolling it back ...")

		await executor.down()
	})

	desc("Print migration status")
	task("status", async (migrationDir = "./db/migrations", configFile = "./config/database.yml") => {
		const executor = new MigrationExecutor(migrationDir, configFile)

		await executor.printCurrentMigrationVersion()
	})

	desc("Setup your database (only supports PostgresSQL)")
	task("setup", async (migrationDir = "./db/migrations", configFile = "./config/database.yml") => {
		const config = (new Connection(configFile)).config[process.env.NODE_ENV || "development"] as Knex.Config
		const database = (config?.connection as Knex.PgConnectionConfig)?.database

		await sh(`psql -d postgres -c "CREATE DATABASE ${database};"`)
		await sh(`psql -d ${database} -c "CREATE SCHEMA aero_migrations_schema;"`)

		await Task("db:migrate").invoke(migrationDir, configFile)
	})
})
