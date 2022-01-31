import { Knex } from "knex"
import ResolveTableType = Knex.ResolveTableType
import pluralize from "pluralize"

import AeroRecord from "./AeroRecord"
import BasicObject from "./BasicObject"
import * as Errors from "./Errors"
import * as Helpers from "./Helpers"
import { Changes, Hooks, ValidationErrors, Validator } from "./model"
import Query from "./Query"

import { ConstructorArgs, DEFAULT_SAVE_OPTIONS, HookType, ModelAttributes, QueryResult, SaveOptions } from "./types"


const privateAttributes = {
	isPersisted: Symbol("isPersisted"),
	changes: Symbol("changes"),
	errors: Symbol("errors"),
}

export type DefaultBase<T = unknown> = Record<string, T> & Base<DefaultBase>

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
	static _tableName: string
	static set tableName(newTableName) {
		this._tableName = newTableName
	}
	static get tableName () {
		return this._tableName ||= pluralize.plural(Helpers.toSnakeCase(this.name))
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

	static validators: Array<Validator<DefaultBase>> = []

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
	static query<TRecord extends Base<TRecord>>(): Query<TRecord> {
		return new Query(this, this.tableName)
	}

	static where<TRecord extends Base<TRecord>>(params: ConstructorArgs<TRecord>): Query<TRecord> {
		return this.query<TRecord>().where(params)
	}

	static whereNot<TRecord extends Base<TRecord>>(params: ConstructorArgs<TRecord>): Query<TRecord> {
		return this.query<TRecord>().whereNot(params)
	}

	private get whereThis(): Query<TRecord> {
		const Class = this.class<typeof Base>()

		const primaryIdentifier = Class.primaryIdentifier as ModelAttributes<TRecord>

		return Class.where<TRecord>({
			[primaryIdentifier]: (this as unknown as TRecord)[primaryIdentifier],
		} as ConstructorArgs<TRecord>)
	}

	static async all<TRecord extends Base<TRecord>>(): Promise<Array<TRecord>> {
		return this.query<TRecord>().all()
	}

	static async findBy<TRecord extends Base<TRecord>>(params: ConstructorArgs<TRecord>): Promise<QueryResult<TRecord>> {
		const record = await this.where(params).first()
		if (!record) return undefined

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

	static fromRow<TRecord extends Base<TRecord>>(row: Awaited<Knex.ResolveTableType<TRecord>>): TRecord {
		const record = this.new<TRecord>()

		record.fromRow(row)

		return record
	}

	private fromRow(row: Awaited<Knex.ResolveTableType<TRecord>>) {
		const camelCased: Record<string, unknown> = {}

		for (const key in row) {
			camelCased[Helpers.toCamelCase(key)] = row[key]
		}

		this.fromObject(camelCased)

		this.__set__(privateAttributes.isPersisted, true)
		this.__set__(privateAttributes.changes, new Changes(this as unknown as TRecord))
	}

	private toRow() {
		const row: Record<string, unknown> = {}

		for (const attribute in this) {
			if (this.changes.includes(attribute as unknown as ModelAttributes<TRecord>)) {
				row[Helpers.toSnakeCase(attribute)] = this[attribute]
			}
		}

		return row
	}

	private fromObject(obj: Record<string, unknown>) {
		for (const key in obj) {
			this.__set__(key, obj[key])
		}
	}

	/**
	 * Perform validation on the record
	 */
	async validate(throwOnError = false) {
		// Call before validation hooks
		await this.callHooks("before", "validation")

		await Promise.all(
			this.class<typeof Base>().validators.map(
				(validator) => validator.validate(this as DefaultBase, throwOnError),
			),
		)

		// Call after validation hooks
		await this.callHooks("before", "validation")
	}

	/**
	 * Saves the record to the database
	 */
	async save(options = DEFAULT_SAVE_OPTIONS): Promise<boolean> {
		// Perform an insert if record hasn't been persisted yet
		if (!this.isPersisted) {
			return this.insert(options)
		} else { // Perform update if record has already been persisted
			return this.update(options)
		}
	}

	/**
	 * Inserts a new record into the database
	 *
	 * @internal
	 */
	async insert(options = DEFAULT_SAVE_OPTIONS): Promise<boolean> {
		options = {
			...DEFAULT_SAVE_OPTIONS,
			...options,
		}

		if (options.validate) await this.validate(options.throwOnError)

		if (this.errors.any()) {
			return false
		}

		// Call before save hooks
		await this.callHooks("before", "save")

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

		// Reload record to get timestamp updates and other generated values from the database
		await this.reload()

		// Reset changes
		this.__set__(privateAttributes.changes, new AeroRecord.Model.Changes(this as unknown as TRecord))

		return true
	}

	/**
	 * Updates an existing database record
	 *
	 * @internal
	 */
	async update(options: SaveOptions = DEFAULT_SAVE_OPTIONS): Promise<boolean> {
		options = {
			...DEFAULT_SAVE_OPTIONS,
			...options,
		}

		if (options.validate) await this.validate(options.throwOnError)

		if (this.errors.any()) return false

		// Call before save hooks
		await this.callHooks("before", "save")

		// Call before update hooks
		await this.callHooks("before", "update")

		const row = this.toRow()

		if (Object.keys(row).length === 0) {
			return false
		}

		// Set timestamp if model has one
		if (this["updatedAt" as keyof this]) {
			row["updated_at"] = new Date()
		}

		// Do update
		await this.whereThis.update(row as ConstructorArgs<TRecord>)

		// Call after update hooks
		await this.callHooks("after", "update")

		// Call after save hooks
		await this.callHooks("after", "save")

		// Reload record to get timestamp updates and other generated values from the database
		await this.reload()

		// Reset changes
		this.__set__(privateAttributes.changes, new AeroRecord.Model.Changes(this as unknown as TRecord))

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
		const newRecord = await this.whereThis.first()

		if (!newRecord) {
			// If it can no longer be found in the DB, mark isPersisted as false
			this.__set__(privateAttributes.isPersisted, false)
		} else {
			this.fromRow(newRecord as Awaited<ResolveTableType<TRecord, "base">>)
		}

		return this
	}

	async destroy() {
		await this.whereThis.destroy()
		this.__set__(privateAttributes.isPersisted, false)
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

	/**
	 * Errors Map, available with errors after validation
	 */
	get errors() {
		return this.__send__(privateAttributes.errors) as ValidationErrors<TRecord>
	}

	static new<TRecord extends Base<TRecord>>(params: ConstructorArgs<TRecord> = {}) {
		let record = new this() as TRecord

		record.__set__(privateAttributes.changes, new Changes(record))
		record.__set__(privateAttributes.isPersisted, false)
		record.__set__(privateAttributes.errors, new ValidationErrors())

		record = Changes.proxifyModel(record)

		record.fromObject(params)

		return record
	}
}
