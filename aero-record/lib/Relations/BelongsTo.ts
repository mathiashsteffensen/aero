import Base from "../Base"
import Relation, { Options } from "./index"
import pluralize from "pluralize"
import { BaseInterface } from "../types"
import BasicObject from "../BasicObject"

const DEFAULT_OPTIONS = (Class: typeof Base) => ({
	localKey: `${pluralize.singular(Class.tableName)}_id`,
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

	find = this.findByLocalKey
	new = this.newByLocalKey
	create = this.createByLocalKey

	then(onFulfilled: (record: TForeignRecord | undefined) => unknown, onRejected?: (err: unknown) => unknown) {
		return this
			.find()
			.then(onFulfilled, onRejected)
	}
}
