import { Options, BaseRelation, DependenceType } from "."
import { BaseInterface } from "../types"
import BasicObject from "@aero/aero-support/dist/typings/BasicObject"
import Base from "../Base"
import DependencyHandler from "./DependencyHandler"

export default class HasMany<
  TForeignRecord extends BaseInterface
  > extends BaseRelation<
  TForeignRecord,
  HasMany<TForeignRecord>
  > {
	constructor(
		attribute: string,
		target: BasicObject,
		Class: typeof Base,
		options: Options<TForeignRecord, HasMany<TForeignRecord>> = {},
	) {
		super("HasMany", attribute, target, Class, options)
	}

	static attachDependencyHandler(
		Class: typeof Base,
		dependencyType: DependenceType,
		attribute: string,
	) {
		Class.after("destroy", DependencyHandler(dependencyType, Class, "HasMany", attribute))
	}

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
