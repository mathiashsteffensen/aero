import { Knex } from "knex"
import pluralize from "pluralize"

import AeroRecord from "./AeroRecord"
import BasicObject from "./BasicObject"
import Hooks from "./Hooks"
import { ConstructorArgs, HookType, ModelAttributes, QueryResult } from "./types"
import Changes from "./Changes"

const privateAttributes = {
	isPersisted: Symbol("isPersisted"),
	changes: Symbol("changes"),
}

/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * AeroRecord.Base is the class all models in your application should inherit from
 *
 * @public
 */
export default class Base<TRecord extends Base<TRecord>> extends BasicObject {

	/**
	 * The table name used when performing queries with this model.
	 *
	 * @remarks
	 * By default, the model name is converted to snake_case and pluralized.
	 * Can be customized by setting a static variable on the model
	 *
	 * @example
	 * Example with customized table name:
	 * ```
	 *   class User {
	 *       static tableName = "my_users"
	 *   }
	 * ```
	 */
	static get tableName () {
		const snakeCased = this.name[0]?.toLowerCase() + this.name.slice(1).replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
		return pluralize.plural(snakeCased)
	}

	static hooks = new Hooks()

	static get before() {
		return this.hooks.before
	}

	static get after() {
		return this.hooks.after
	}

	/**
	 * Instantiate a new query for this model
	 *
	 * @internal
	 */
	get query() {
		return AeroRecord
			.connection
			.knex((this.constructor as typeof Base).tableName)
	}

	/**
	 * Instantiate a new static query for this model
	 *
	 * @internal
	 */
	static query<TRecord extends Base<TRecord>>() {
		return AeroRecord
			.connection
			.knex<TRecord>(this.tableName)
	}

	static async findBy<TRecord extends Base<TRecord>>(params: ConstructorArgs<TRecord>): Promise<QueryResult<TRecord>> {
		const row = await this.query<TRecord>().where(params).first()
		if (!row) return undefined

		const record = new this() as TRecord

		record.fromRow(row as Awaited<Knex.ResolveTableType<TRecord>>)

		return record
	}

	fromRow(row: Awaited<Knex.ResolveTableType<TRecord>>) {
		this.fromObject(row as Record<string, unknown>)

		this.__set__(privateAttributes.isPersisted, true)
	}

	fromObject(obj: Record<string, unknown>) {
		for (const key in obj) {
			this.__set__(key, obj[key])
		}
	}

	/**
	 * Saves the record to the database
	 */
	async save() {
		// Call before save hooks
		await this.callHooks("before", "save")

		// Perform an insert if record hasn't been persisted yet
		if (!this.isPersisted) {
			// Call before create hooks
			await this.callHooks("before", "create")

			// Do insert
			await this.query.insert(this)

			// If save succeeds, mark record as persisted
			this.__set__(privateAttributes.isPersisted, true)

			// Call after create hooks
			await this.callHooks("after", "create")
		} else { // Perform update if record has already been persisted
			// Call before update hooks
			await this.callHooks("before", "update")

			// Do update
			await this.query.update(this)

			// Call after update hooks
			await this.callHooks("after", "update")
		}

		// Call after save hooks
		await this.callHooks("after", "save")

		// Reset changes
		this.__set__(privateAttributes.changes, new Changes(this as unknown as TRecord))
	}

	get changes() {
		return this.__send__(privateAttributes.changes) as Changes<TRecord>
	}

	attributeChanged(attribute: ModelAttributes<TRecord>) {
		return this.changes.includes(attribute)
	}

	/**
	 * Whether the instance has been saved to the database yet
	 */
	get isPersisted() {
		return this.__send__(privateAttributes.isPersisted) as boolean
	}

	/**
	 * Opposite of isPersisted
	 */
	get isNewRecord() {
		return !this.__send__(privateAttributes.isPersisted) as boolean
	}

	get callHooks(): (timing: "before" | "after", event: HookType) => void {
		return (this.constructor as typeof Base).hooks.callHooks<Base<any>>(this)
	}

	static new<TRecord extends Base<TRecord>>(params: ConstructorArgs<TRecord> = {}) {
		let record = new this() as TRecord

		record.__set__(privateAttributes.changes, new Changes(record))
		record.__set__(privateAttributes.isPersisted, false)

		record = Changes.proxifyModel(record)

		record.fromObject(params)

		return record
	}
}
