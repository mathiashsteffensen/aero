import { Knex } from "knex"
import pluralize from "pluralize"

import AeroRecord from "./AeroRecord"
import BasicObject from "./BasicObject"
import Changes from "./Changes"
import * as Errors from "./Errors"
import * as Helpers from "./Helpers"
import Hooks from "./Hooks"

import { ConstructorArgs, HookType, ModelAttributes, QueryResult } from "./types"

const privateAttributes = {
	isPersisted: Symbol("isPersisted"),
	changes: Symbol("changes"),
}

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
		return pluralize.plural(Helpers.toSnakeCase(this.name))
	}

	/**
	 * Primary identifier column to use for .find calls, defaults to "id"
	 *
	 * @remarks
	 * Records are required to have a primary identifier column to be able to use .find
	 * and all methods that use it under the hood, those methods are:
	 * - AeroRecord.Base#reload
	 *
	 * @example
	 * Customizing the primary identifier:
	 * ```
	 * import AeroRecord from "@aero/aero-record";
	 *
	 * class User extends AeroRecord.Base<User> {
	 * 		static primaryIdentifier = "user_id"
	 * }
	 *
	 * export {
	 *     User
	 * }
	 * ```
	 */
	static get primaryIdentifier() {
		return "id"
	}
	get primaryIdentifier() {
		return this.class<typeof Base>().primaryIdentifier
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
			.knex((this.class<typeof Base>()).tableName)
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

		const record = this.new<TRecord>()

		record.fromRow(row as Awaited<Knex.ResolveTableType<TRecord>>)

		record.__set__(privateAttributes.changes, new Changes(record))

		return record
	}

	static async find<TRecord extends Base<TRecord>>(id: string | number): Promise<TRecord> {
		const record = await this.findBy<TRecord>({ [this.primaryIdentifier]: id } as unknown as ConstructorArgs<TRecord>)

		if (!record) throw new Errors.RecordNotFound(`Couldn't find ${this.name} with ${this.primaryIdentifier} = "${id}"`)

		return record
	}

	static async create<TRecord extends Base<TRecord>>(params: ConstructorArgs<TRecord>): Promise<TRecord> {
		const record = this.new(params)

		await record.save()

		return record
	}

	fromRow(row: Awaited<Knex.ResolveTableType<TRecord>>) {
		const camelCased: Record<string, unknown> = {}

		for (const key in row) {
			camelCased[Helpers.toCamelCase(key)] = row[key]
		}

		this.fromObject(camelCased)

		this.__set__(privateAttributes.isPersisted, true)
	}

	toRow() {
		const row: Record<string, unknown> = {}

		for (const attribute in this) {
			if (this.changes.includes(attribute as unknown as ModelAttributes<TRecord>)) {
				row[Helpers.toSnakeCase(attribute)] = this[attribute]
			}
		}

		return row
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

		let callAfterHook = true

		// Perform an insert if record hasn't been persisted yet
		if (!this.isPersisted) {
			await this.insert()
		} else { // Perform update if record has already been persisted
			callAfterHook = await this.update()
		}

		// Call after save hooks
		if (callAfterHook) {
			await this.callHooks("after", "save")
		}
	}

	/**
	 * Inserts a new record into the database
	 *
	 * @internal
	 */
	async insert() {
		// Call before create hooks
		await this.callHooks("before", "create")

		// Do insert
		const result = await this
			.query
			.returning(this.primaryIdentifier)
			.insert(this.toRow())

		// Set primary identifier
		if (result[0] && this.primaryIdentifier) {
			this[this.primaryIdentifier as keyof this] = result[0] as unknown as this[keyof this]
		}

		// If insert succeeds, mark record as persisted
		this.__set__(privateAttributes.isPersisted, true)

		// Call after create hooks
		await this.callHooks("after", "create")

		// Reset changes
		this.__set__(privateAttributes.changes, new Changes(this as unknown as TRecord))

		// Reload record to get timestamp updates and other generated values from the database
		await this.reload()
	}

	/**
	 * Updates an existing database record
	 *
	 * @internal
	 */
	async update() {
		// Call before update hooks
		await this.callHooks("before", "update")

		const row = this.toRow()

		if (Object.keys(row).length === 0) {
			return false
		}

		// Do update
		await this.query.update(row)

		// Call after update hooks
		await this.callHooks("after", "update")

		// Reset changes
		this.__set__(privateAttributes.changes, new Changes(this as unknown as TRecord))

		// Reload record to get timestamp updates and other generated values from the database
		await this.reload()

		return true
	}

	/**
	 * Reload the record from your database
	 *
	 * @remarks
	 * Reloads the record from the database based on the primary identifier,
	 * if no record is found on reload it will mark this record as no longer persisted
	 */
	async reload() {
		const RecordClass = this.class<typeof Base>()
		const primaryIdentifier = RecordClass.primaryIdentifier as ModelAttributes<TRecord>

		// Use findBy so we don't throw on not found
		const newRecord = await RecordClass.findBy<TRecord>({
			[primaryIdentifier]: (this as unknown as TRecord)[primaryIdentifier],
		} as ConstructorArgs<TRecord>)

		if (!newRecord) {
			// If it can no longer be found in the DB, mark isPersisted as false
			this.__set__(privateAttributes.isPersisted, false)
		} else {
			Object.assign(this, newRecord)
		}
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
		return this.class<typeof Base>().hooks.callHooks<Base<TRecord>>(this)
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
