import pluralize from "pluralize"

import BasicObject from "@aero/aero-support/lib/BasicObject"

import Base from "../Base"
import { Options } from "../Relations"
import BelongsTo from "../Relations/BelongsTo"
import HasOne from "../Relations/HasOne"
import HasMany from "../Relations/HasMany"
import { BaseInterface } from "../types"

export const belongsTo = (ForeignClass: () => { new(): unknown }, options: Options<any, BelongsTo<any>> = {}) => {
	return <TRecord extends BasicObject>(target: TRecord, propertyKey: keyof TRecord) => {
		(target.class() as typeof Base).after("initialization", (instance) => {
			instance.__set__(
				propertyKey,
				new BelongsTo(instance, ForeignClass() as typeof Base, options),
			)
		})
	}
}

export const hasOne = (ForeignClass: () => { new(): unknown }, options: Options<any, HasOne<any>> = {}) => {
	return <TRecord extends BaseInterface>(target: TRecord, propertyKey: keyof TRecord) => {
		(target.class() as typeof Base).after("initialization", (instance) => {
			instance.__set__(propertyKey, new HasOne(instance, ForeignClass() as typeof Base, {
				foreignKey: `${pluralize.singular((target.class() as typeof Base).tableName)}_id`,
				...options,
				localKey: undefined,
			}))
		})
	}
}

export const hasMany = (ForeignClass: () => { new(): unknown }, options: Options<any, HasOne<any>> = {}) => {
	return <TRecord extends BaseInterface>(target: TRecord, propertyKey: keyof TRecord) => {
		(target.class() as typeof Base).after("initialization", (instance) => {
			instance.__set__(propertyKey, new HasMany(instance, ForeignClass() as typeof Base, {
				foreignKey: `${pluralize.singular((target.class() as typeof Base).tableName)}_id`,
				...options,
				localKey: undefined,
			}))
		})
	}
}
