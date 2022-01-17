import { Knex } from "knex"
import DbRecordArr = Knex.DbRecordArr
import CompositeTableType = Knex.CompositeTableType
import ResolveTableType = Knex.ResolveTableType

import AeroRecord from "./AeroRecord"
import Base from "./Base"
import * as Helpers from "./Helpers"

import { ConstructorArgs } from "./types"

type QueryParams<TRecord extends Base<TRecord>> = ConstructorArgs<TRecord> | string;

export default class Query<TRecord extends Base<TRecord>> {
	#RecordClass: typeof Base
	#state: Knex.QueryBuilder<TRecord>

	constructor(RecordClass: typeof Base, tableName: string) {
		this.#RecordClass = RecordClass

		if (!AeroRecord.connection) {
			throw new Error("Can't initialize query before establishing connection to database")
		}

		this.#state = AeroRecord.connection.knex<TRecord>(tableName)
	}

	/**
	 * Duplicate a method from the knex instance
	 *
	 * @internal
	 */
	private knexDup<TArgs>(methodName: keyof Knex.QueryBuilder) {
		return (args: TArgs) => {
			if (typeof args === "object") {
				args = Helpers.snakeCaseKeys(args as Record<string, unknown>) as TArgs
			}

			this.#state = (this.#state[methodName] as (args: TArgs) => Knex.QueryBuilder)(args)
			return this
		}
	}


	where = this.knexDup<QueryParams<TRecord>>("where")
	whereNot = this.knexDup<QueryParams<TRecord>>("whereNot")

	async first() {
		return this.#RecordClass.fromRow(await this.#state.first())
	}

	async all(): Promise<Array<TRecord>> {
		return (await this.#state)
			.map(
				(row: Awaited<ResolveTableType<TRecord>>) => this.#RecordClass.fromRow<TRecord>(row),
			)
	}

	async update(args: ConstructorArgs<TRecord>) {
		return this.#state.update(
			args as TRecord extends CompositeTableType<unknown> ? ResolveTableType<TRecord, "update"> : DbRecordArr<TRecord>,
		)
	}

	async destroy() {
		await this.#state.del()
	}

	toString() { return this.#state.toString() }
	toSQL() { return this.#state.toSQL() }
}
