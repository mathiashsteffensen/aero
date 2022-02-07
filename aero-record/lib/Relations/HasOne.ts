import Relation from "."
import { BaseInterface } from "../types"

export default class HasOne<
  TForeignRecord extends BaseInterface
> extends Relation<
  TForeignRecord,
  HasOne<TForeignRecord>
> {

	find() {
		return this.findByForeignKey()
	}

	new = this.newByForeignKey
	create = this.createByForeignKey

	then(onFulfilled: (record: TForeignRecord | undefined) => unknown, onRejected?: (err: unknown) => unknown) {
		return this
			.find()
			.then(onFulfilled, onRejected)
	}
}
