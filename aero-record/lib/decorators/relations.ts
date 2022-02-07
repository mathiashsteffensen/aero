import pluralize from "pluralize"

import Base from "../Base"
import { Options } from "../Relations"
import BelongsTo from "../Relations/BelongsTo"
import HasOne from "../Relations/HasOne"
import BasicObject from "../BasicObject"

export const belongsTo = (ForeignClass: { new(): unknown }, options: Options<any, BelongsTo<any>> = {}) => {
	return <TRecord extends BasicObject>(target: TRecord, propertyKey: keyof TRecord) => {
		const privateField = Symbol(`belongs_to_${propertyKey}`)
		Object.defineProperty(
			target,
			propertyKey,
			{
				get() {
					return this[privateField] ||= new BelongsTo(this, ForeignClass as typeof Base, options)
				},
			},
		)
	}
}

export const hasOne = (ForeignClass: { new(): unknown }, options: Options<any, HasOne<any>> = {}) => {
	return <TRecord extends BasicObject>(target: TRecord, propertyKey: keyof TRecord) => {
		const privateField = Symbol(`has_one_${propertyKey}`)
		Object.defineProperty(
			target,
			propertyKey,
			{
				get() {
					return this[privateField] ||= new HasOne(this, ForeignClass as typeof Base, {
						foreignKey: `${pluralize.singular((target.class<typeof Base>()).tableName)}_id`,
						...options,
						localKey: undefined,
					})
				},
			},
		)
	}
}
