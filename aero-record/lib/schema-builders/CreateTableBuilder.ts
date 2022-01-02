import { Knex } from "knex"
import { ColumnType } from "../types"

export default class CreateTableBuilder {
	private knex: Knex.CreateTableBuilder

	/**
   * @internal
   */
	constructor(t: Knex.CreateTableBuilder) {
		this.knex = t
	}

	id(columnType: ColumnType | "increments", columnName = "id") {
		if (columnType === "increments") {
			this.knex.increments(columnName)
			return
		}

		this.knex[columnType](columnName)
		this.knex.primary([columnName])
	}

	timestamps() {
		this.knex.timestamps(true, true)
	}

	addColumn(columnType: ColumnType, columnName: string) {
		this.knex[columnType](columnName)
	}
}
