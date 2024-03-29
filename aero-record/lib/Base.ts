import { Knex } from "knex"
import ResolveTableType = Knex.ResolveTableType
import pluralize from "pluralize"

import AeroSupport from "@aero/aero-support"
import BasicObject from "@aero/aero-support/dist/typings/BasicObject"

import AeroRecord from "./AeroRecord"
import * as Errors from "./Errors"
import * as Helpers from "./Helpers"
import { Changes, Hooks, ValidationErrors, Validator } from "./model"
import Query from "./Query"
import { BaseRelation } from "./Relations"

import {
	ConstructorArgs,
	DEFAULT_SAVE_OPTIONS,
	ModelAttributes,
	QueryResult,
	SaveOptions,
	BaseInterface,
	Public,
} from "./types"
import { HookType } from "./model/Hooks"
import { HookAction, HookOptions } from "@aero/aero-support/dist/typings/Hooks"
import TransactionManager from "./model/TransactionManager"

const privateAttributes = {
	isPersisted: Symbol("isPersisted"),
	changes: Symbol("changes"),
	errors: Symbol("errors"),
	callHooks: Symbol("callHooks"),
}

export type DefaultBase<T = unknown> = Record<string, T> & Base<DefaultBase>

/**
 * AeroRecord.Base is the class all models in your application should inherit from
 *
 * @public
 */
export default class Base<TRecord extends BaseInterface> extends AeroSupport.BasicObject implements BaseInterface {

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
	 *       static get tableName() {
	 *         return "my_users"
	 *       }
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
	 * - Relations#find
	 *
	 * @example
	 * Customizing the primary identifier:
	 * ```
	 * import AeroRecord from "@aero/aero-record";
	 *
	 * class User extends AeroRecord.Base<User> {
	 * 		static get primaryIdentifier() {
	 * 		  return "user_id"
	 * 		}
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

	static before<TRecord extends BaseInterface>(
		type: HookType,
		methods: HookAction<TRecord>["action"] | Array<HookAction<TRecord>["action"]>,
		options: HookOptions<TRecord> = {},
	) {
		return Hooks.before(this.tableName)(type, methods as keyof BaseInterface, options as HookOptions<Record<string, unknown>>)
	}

	static after<TRecord extends BaseInterface>(
		type: HookType,
		methods: HookAction<TRecord>["action"] | Array<HookAction<TRecord>["action"]>,
		options: HookOptions<TRecord> = {},
	) {
		return Hooks.after(this.tableName)(type, methods as keyof BaseInterface, options as HookOptions<Record<string, unknown>>)
	}

	static validators: Array<Validator<DefaultBase>> = []

	/**
	 * Instantiate a new query for this model
	 *
	 * @internal
	 */
	get query() {
		return (this.class<typeof Base>()).query(this.transaction.transactionOrConnection)
	}

	/**
	 * Instantiate a new query for this model
	 */
	static query<TRecord extends BaseInterface>(connection?: Knex): Query<TRecord> {
		return new Query(this, this.tableName, connection?.(this.tableName))
	}

	static async transaction<
		TRecord extends BaseInterface, TReturns
		>(
		callback: (args: { query: Query<TRecord> }) => (Promise<TReturns> | TReturns),
	): Promise<TReturns> {
		const tableName = this.tableName

		const transaction = await AeroRecord.connection.knex.transaction()

		let result: TReturns

		try {
			result = await callback({
				get query() {
					return new Query(this, tableName, transaction(tableName))
				},
			})

			await transaction.commit()

			return result
		} catch (e) {
			await transaction.rollback()
			throw e
		}
	}

	transaction = new TransactionManager()
	async transact<TReturns>(callback: () => Promise<TReturns>): Promise<TReturns | undefined> {
		if (this.transaction.isTransacting) {
			return await callback()
		}

		await this.transaction.begin()

		try {
			const result = await callback()

			await this.transaction.commit()

			return result
		} catch (e) {
			await this.transaction.rollback()
			throw e
		}
	}

	static where<TRecord extends BaseInterface>(params: ConstructorArgs<TRecord>): Query<TRecord> {
		return this.query<TRecord>().where(params)
	}

	static whereNot<TRecord extends BaseInterface>(params: ConstructorArgs<TRecord>): Query<TRecord> {
		return this.query<TRecord>().whereNot(params)
	}

	get whereThis(): Query<TRecord> {
		const Class = this.class<typeof Base>()

		const primaryIdentifier = Class.primaryIdentifier as ModelAttributes<TRecord>

		return Class.where<TRecord>({
			[primaryIdentifier]: (this as unknown as TRecord)[primaryIdentifier],
		} as ConstructorArgs<TRecord>)
	}

	static async all<TRecord extends BaseInterface>(): Promise<Array<TRecord>> {
		return this.query<TRecord>().all()
	}

	static async findBy<TRecord extends BaseInterface>(params: ConstructorArgs<TRecord>): Promise<QueryResult<TRecord>> {
		const record = await this.where(params).first()
		if (!record) return undefined

		record.__set__(privateAttributes.changes, new Changes(record))

		return record
	}

	static async find<TRecord extends BaseInterface>(id: string | number): Promise<TRecord> {
		const record = await this.findBy<TRecord>({ [this.primaryIdentifier]: id } as unknown as ConstructorArgs<TRecord>)

		if (!record) throw new Errors.RecordNotFound(`Couldn't find ${this.name} with ${this.primaryIdentifier} = "${id}"`)

		return record
	}

	static async create<TRecord extends BaseInterface>(params: ConstructorArgs<TRecord>, options = DEFAULT_SAVE_OPTIONS): Promise<TRecord> {
		const record = this.new(params)

		await record.save(options)

		return record
	}

	static fromRow<TRecord extends BaseInterface>(row: Awaited<Knex.ResolveTableType<TRecord>>): TRecord {
		const record = this.new<TRecord>()

		record.fromRow(row)

		return record
	}

	fromRow(row: Awaited<Knex.ResolveTableType<TRecord>>) {
		const camelCased: Record<string, unknown> = {}

		for (const key in row) {
			camelCased[Helpers.toCamelCase(key)] = row[key]
		}

		this.fromObject(camelCased)

		this.__set__(privateAttributes.isPersisted, true)
		this.__set__(privateAttributes.changes, new Changes(this as unknown as TRecord))
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

	toObject() {
		const obj: Record<string, unknown> = {}

		for (const attribute in this) {
			const value = this[attribute]

			if (value instanceof BaseRelation) continue

			obj[attribute] = this[attribute]
		}

		return obj
	}

	/**
	 * Update attributes for the model, does not save the updates
	 */
	updateAttributes(attributes: ConstructorArgs<TRecord>) {
		this.fromObject(attributes)
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
	async reload(): Promise<this> {
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
		return this.transact(async () => {
			await this.callHooks("before", "destroy")

			await this.whereThis.destroy()
			this.__set__(privateAttributes.isPersisted, false)

			await this.callHooks("after", "destroy")
		})
	}

	get changes(): Public<Changes<TRecord>> {
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

	get callHooks(): (timing: "before" | "after", event: HookType) => Promise<void> {
		const existing = (this.__send__(privateAttributes.callHooks) as (timing: "before" | "after", event: HookType) => Promise<void>)

		if (existing) return existing

		const newFunction = Hooks.callHooks(this as Record<string, unknown> & BasicObject)

		this.__set__(privateAttributes.callHooks, newFunction)

		return newFunction
	}

	/**
	 * Errors Map, available with errors after validation
	 */
	get errors() {
		return this.__send__(privateAttributes.errors) as ValidationErrors<TRecord>
	}

	static new<TRecord extends BaseInterface>(params: ConstructorArgs<TRecord> = {}) {
		let record = new this() as unknown as TRecord

		record.__set__(privateAttributes.changes, new Changes(record))
		record.__set__(privateAttributes.isPersisted, false)
		record.__set__(privateAttributes.errors, new ValidationErrors())

		record = Changes.proxifyModel(record)

		record.fromObject(params)

		record.callHooks("after", "initialization")

		return record
	}
}
