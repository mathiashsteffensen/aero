import pluralize from "pluralize"

import Hooks from "./Hooks"
import { ConstructorArgs, HookType } from "./types"
import AeroRecord from "./AeroRecord"

/**
 * AeroRecord.Base is the class all models in your application should inherit from
 *
 * @public
 */
export default class Base<TRecord> extends Object {
	/**
	 * The table name used when performing queries with this model.
	 *
	 * @remarks
	 * By default, the model name is converted to snake_case.
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

	protected static hooks = new Hooks()

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
			this.#isPersisted = true

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
	}

	/**
	 * Whether the instance has been saved to the database yet
	 */
	#isPersisted = false
	get isPersisted() {
		return this.#isPersisted
	}

	/**
	 * Opposite of isPersisted
	 */
	get isNewRecord() {
		return !this.#isPersisted
	}

	get callHooks(): (timing: "before" | "after", event: HookType) => void {
		return (this.constructor as typeof Base).hooks.callHooks<this>(this)
	}

	__send__(attribute: string | symbol | number) {
		return (this as Record<string | symbol | number, unknown>)[attribute] as unknown
	}

	async __send_func__(attribute: string | symbol | number) {
		return (this.__send__(attribute) as () => unknown | Promise<unknown>).call(this)
	}

	attributeIsMethod(attribute: string | symbol | number) {
		return typeof this.__send__(attribute) == "function"
	}

	constructor(params: ConstructorArgs<TRecord> = undefined) {
		super(params)
	}
}
