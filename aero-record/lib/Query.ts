import { Knex } from "knex"

import AeroRecord from "./AeroRecord"
import Base from "./Base"
import { ConstructorArgs } from "./types"

type QueryParams<TRecord extends Base<TRecord>> = ConstructorArgs<TRecord> | string;

/* eslint-disable @typescript-eslint/no-explicit-any */
export default class Query<TRecord extends Base<any>> {
	private _state: Knex.QueryBuilder<TRecord>

	constructor(tableName: string) {
		if (!AeroRecord.connection) {
			throw new Error("Can't initialize query before establishing connection to database")
		}

		this._state = AeroRecord.connection.knex<TRecord>(tableName)
	}

	where(params: QueryParams<TRecord>) {
		this._state = this._state.where(params)

		return this
	}

	static where<TRecord extends Base<any>>(tableName: string, params: QueryParams<TRecord> | string) {
		(new Query<TRecord>(tableName)).where(params)
	}

	async first(limit = 1) {
		return this._state.limit(limit)
	}
}
