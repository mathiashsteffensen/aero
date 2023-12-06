import { BaseRelation, Options } from "."
import { BaseInterface } from "../types"
import Base from "../Base"
import BasicObject from "@aero/aero-support/dist/typings/BasicObject"

export default class HasOne<
  TForeignRecord extends BaseInterface
> extends BaseRelation<
  TForeignRecord,
  HasOne<TForeignRecord>
> {

	constructor(
		attribute: string,
		target: BasicObject,
		Class: typeof Base,
		options: Options<TForeignRecord, HasOne<TForeignRecord>> = {},
	) {
		super("HasOne", attribute, target, Class, options)
	}

	find() {
		return this.findByForeignKey()
	}

	new = this.newByForeignKey
	create = this.createByForeignKey
	update = this.updateByForeignKey

	then(onFulfilled: (record: TForeignRecord | undefined) => unknown, onRejected?: (err: unknown) => unknown) {
		return this
			.find()
			.then(onFulfilled, onRejected)
	}
}
