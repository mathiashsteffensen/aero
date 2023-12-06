import { Knex } from "knex"
import DbRecordArr = Knex.DbRecordArr
import CompositeTableType = Knex.CompositeTableType
import ResolveTableType = Knex.ResolveTableType

import AeroRecord from "./AeroRecord"
import Base from "./Base"
import * as Helpers from "./Helpers"

import { ConstructorArgs, BaseInterface } from "./types"

export type QueryParams<TRecord extends BaseInterface> = ConstructorArgs<TRecord> | string;

export default class Query<TRecord extends BaseInterface> {
	constructor(
		private RecordClass: typeof Base,
		tableName: string,
		private state: Knex.QueryBuilder<TRecord> = AeroRecord.connection.knex<TRecord>(tableName),
	) {

		if (!AeroRecord.connection) {
			throw new Error("Can't initialize query before establishing connection to database")
		}
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

			this.state = (this.state[methodName] as (args: TArgs) => Knex.QueryBuilder)(args)
			return this
		}
	}


	where = this.knexDup<QueryParams<TRecord>>("where")
	whereNot = this.knexDup<QueryParams<TRecord>>("whereNot")
	returning = this.knexDup<string>("returning")
	select(...columns: Array<string>) {
		this.state = this.state.select(...columns)

		return this
	}

	async exists(): Promise<boolean> {
		const result = await this.select(this.RecordClass.primaryIdentifier).first()

		return !!result
	}

	async first(): Promise<TRecord | undefined> {
		const row = await this.state.first()

		return row ? this.RecordClass.fromRow(row) : undefined
	}

	async all(): Promise<Array<TRecord>> {
		return (await this.state)
			.map(
				(row: Awaited<ResolveTableType<TRecord>>) => this.RecordClass.fromRow<TRecord>(row),
			)
	}

	insert(args: ConstructorArgs<TRecord>) {
		return this.state.insert(
			args as TRecord extends CompositeTableType<unknown> ? ResolveTableType<TRecord, "insert"> : DbRecordArr<TRecord>,
		)
	}

	update(args: ConstructorArgs<TRecord>) {
		return this.state.update(
			args as TRecord extends CompositeTableType<unknown> ? ResolveTableType<TRecord, "update"> : DbRecordArr<TRecord>,
		)
	}

	async destroy() {
		await this.state.del()
	}

	toString() { return this.state.toString() }
	toSQL() { return this.state.toSQL() }
}
