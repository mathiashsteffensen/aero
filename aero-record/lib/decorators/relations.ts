import Base from "../Base"
import BelongsTo from "../BelongsTo"
import { Options } from "../Relation"
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
