import Base from "./Base"
import Relation, { Options } from "./Relation"
import pluralize from "pluralize"
import { BaseInterface, ConstructorArgs, DEFAULT_SAVE_OPTIONS, SaveOptions } from "./types"
import BasicObject from "./BasicObject"

const DEFAULT_OPTIONS = (Class: typeof Base) => ({
	key: `${pluralize.singular(Class.tableName)}_id`,
})

export default class BelongsTo<
  TForeignRecord extends BaseInterface,
> extends Relation<TForeignRecord, BelongsTo<TForeignRecord>> {
	constructor(
		target: BasicObject,
		Class: typeof Base,
		options: Options<TForeignRecord, BelongsTo<TForeignRecord>> = {},
	) {
		super(target, Class, options)

		this.options = {
			...this.options,
			...DEFAULT_OPTIONS(Class),
		}
	}

	#find = this.baseFind("key")
	async find() {
		return this.#find(this.key)
	}

	#create = this.baseCreate("key")
	create(params: ConstructorArgs<TForeignRecord>, options: SaveOptions = DEFAULT_SAVE_OPTIONS) {
		return this.#create(this.key, params, options)
	}

	then(onFulfilled: (record: TForeignRecord) => unknown, onRejected?: (err: unknown) => unknown) {
		return this
			.find()
			.then(onFulfilled, onRejected)
	}
}
