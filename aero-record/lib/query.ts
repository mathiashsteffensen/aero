import { Knex } from "knex"

import AeroRecord from "./AeroRecord"

type QueryParams<TRecord> = {
	[property in keyof TRecord]: TRecord[keyof TRecord];
};

export default class Query<TRecord> {
	private _state: Knex.QueryBuilder<TRecord>

	constructor(tableName: string) {
		if (!AeroRecord.connection) {
			throw new Error("Can't initialize query before establishing connection to database")
		}

		this._state = AeroRecord.connection.knex<TRecord>(tableName)
	}

	where(params: QueryParams<TRecord> | string) {
		this._state = this._state.where(params)
	}

	static where<TRecord>(tableName: string, params: QueryParams<TRecord> | string) {
		(new Query<TRecord>(tableName)).where(params)
	}
}
