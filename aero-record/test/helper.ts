import knexConstructor, { Knex } from "knex"

import AeroRecord from "../lib/AeroRecord"

AeroRecord.establishConnection("test", "test/fixtures/config/database.yml")

const knex = knexConstructor(AeroRecord.connection.config["test"] as Knex.Config)

knex.on("query-error", (data) => AeroRecord.logger.warn(data))

// Run all specs in a transaction
export const mochaHooks = {
	async beforeEach() {
		AeroRecord.connection.knex = await knex.transaction()
	},
	async afterEach() {
		await (AeroRecord.connection.knex as Knex.Transaction).rollback()
	},
	async afterAll() {
		await AeroRecord.connection.close()
		await knex.destroy()
	},
}
