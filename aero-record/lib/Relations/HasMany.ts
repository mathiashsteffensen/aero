import Relation from "."
import { BaseInterface } from "../types"

export default class HasMany<
  TForeignRecord extends BaseInterface
  > extends Relation<
  TForeignRecord,
  HasMany<TForeignRecord>
  > {

	query = this.queryByForeignKey
	get where() {
		return this.query().where
	}
	find = this.findByForeignKey
	all = this.allByForeignKey
	new = this.newByForeignKey
	create = this.createByForeignKey
	update = this.updateByForeignKey

	then(onFulfilled: (record: Array<TForeignRecord | undefined>) => unknown, onRejected?: (err: unknown) => unknown) {
		return this
			.all()
			.then(onFulfilled, onRejected)
	}
}
