import { Knex } from "knex"
import Raw = Knex.Raw

import { ColumnOptions, ColumnType } from "./types"

export default class TableBuilder {
	/**
   * @internal
   */
	private readonly knex: Knex.TableBuilder

	/**
   * @internal
   */
	constructor(t: Knex.TableBuilder) {
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

	addColumn(columnType: ColumnType, columnName: string, columnOptions: ColumnOptions = {}) {
		const column = this.knex[columnType](columnName)

		if (Object.keys(columnOptions).includes("default")) {
			column.notNullable().defaultTo(columnOptions.default as Raw<unknown>)
		}

		if (columnOptions.null === false) {
			column.notNullable()
		}
	}

	dropColumn(name: string) {
		this.knex.dropColumn(name)
	}

	renameColumn(from: string, to: string) {
		this.knex.renameColumn(from, to)
	}

	addIndex(columns: string | Array<string>, options: { unique?: boolean } = {}) {
		if (options.unique) {
			this.knex.unique(typeof columns === "string" ? [columns] : columns)
		} else {
			this.knex.index(columns)
		}
	}

	dropIndex(columns: string | Array<string>) {
		this.knex.dropIndex(columns)
	}
}
