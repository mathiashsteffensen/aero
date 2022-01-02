import { Knex } from "knex"
import AeroRecord from "./AeroRecord"
import fs from "fs"

export default class MigrationExecutor {
	migrationDir: string
	migrationList: Array<string>
	migrate: Knex.Migrator
	migratorConfig: Knex.MigratorConfig

	constructor(migrationDir: string, configFile: string) {
		this.migrationDir = migrationDir
		this.migrationList = fs.readdirSync(migrationDir)
		this.migratorConfig = {
			directory: migrationDir,
			schemaName: "aero_migrations_schema",
			tableName: "aero_migrations",
			loadExtensions: [".js"],
		}

		AeroRecord.establishConnection(process.env.NODE_ENV || "development", configFile)
		this.migrate =  AeroRecord.connection.knex.migrate
	}

	async up() {
		await this.migrate.up(this.migratorConfig)
	}

	async down() {
		await this.migrate.down(this.migratorConfig)
	}

	async migrationStatus() {
		// Knex returns the timestamp of the current version
		const timestamp = await this.migrate.currentVersion(this.migratorConfig)

		const index = this.migrationList.findIndex((s: string) => s.startsWith(timestamp))

		if (index === -1) {
			return 0
		} else {
			return index + 1
		}
	}

	async migrationsToRun() {
		return this.migrationList.slice(await this.migrationStatus())
	}

	async printCurrentMigrationVersion() {
		const status = await this.migrationStatus()
		console.log(`Migrations are on version ${status}`)

		if (status == 0) {
			return
		}

		const lastMigration = this.migrationList[status - 1]

		console.log(`Last migration run was '${this.migrationName(lastMigration)}'`)
	}

	/* eslint-disable @typescript-eslint/ban-ts-comment */
	// @ts-ignore
	migrationName = (fileName: string | undefined) => fileName.split("_")[1].split(".js")[0]
	/* eslint-enable @typescript-eslint/ban-ts-comment */
}
