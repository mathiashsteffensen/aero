import { Knex } from "knex"
import TableBuilder from "./TableBuilder"

export interface IMigration {
	up: () => void
	down: () => void
}

export default class Migration {
	schema = "public"

	knex: Knex
	constructor(knex: Knex) {
		this.knex = knex
	}

	/**
	 * @internal
	 */
	private get withSchema() {
		return this.knex.schema.withSchema(this.schema)
	}

	/**
	 * Create a new table in the database
	 *
	 * @param tableName - name of the table to create
	 * @param callback - callback used to configure the table
	 */
	async createTable(tableName: string, callback: (t: TableBuilder) => void) {
		return this.withSchema.createTable(tableName, (knex: Knex.CreateTableBuilder) => callback(new TableBuilder(knex)))
	}

	/**
	 * Alter an existing database table
	 *
	 * @param tableName - name of the table to alter
	 * @param callback - callback used to perform alterations on the table
	 */
	async alterTable(tableName: string, callback: (t: TableBuilder) => void) {
		return this.withSchema.alterTable(tableName, (knex: Knex.CreateTableBuilder) => callback(new TableBuilder(knex)))
	}

	/**
	 * Drop a database table
	 *
	 * @param tableName - name of the table to drop
	 */
	async dropTable(tableName: string) {
		return this.withSchema.dropTableIfExists(tableName)
	}

	/**
	 * @internal
	 */
	static async up(knex: Knex) {
		return (new this(knex) as unknown as IMigration).up()
	}

	/**
	 * @internal
	 */
	static async down(knex: Knex) {
		return (new this(knex) as unknown as IMigration).down()
	}
}
