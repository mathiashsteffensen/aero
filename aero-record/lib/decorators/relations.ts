import pluralize from "pluralize"

import BasicObject from "@aero/aero-support/lib/BasicObject"

import Base from "../Base"
import { Options } from "../Relations"
import BelongsTo from "../Relations/BelongsTo"
import HasOne from "../Relations/HasOne"
import HasMany from "../Relations/HasMany"
import { BaseInterface } from "../types"

export const belongsTo = (ForeignClass: () => { new(): unknown }, options: Options<BaseInterface, BelongsTo<BaseInterface>> = {}) => {
	return <TRecord extends BasicObject>(target: TRecord, propertyKey: keyof TRecord) => {
		const Class = (target.class() as typeof Base)

		if (options.dependent) {
			BelongsTo.attachDependencyHandler(
				Class,
				options.dependent,
				propertyKey as string,
			)
		}

		Class.after("initialization", (instance) => {
			instance.__set__(
				propertyKey,
				new BelongsTo(propertyKey as string, instance, ForeignClass() as typeof Base, options),
			)
		})
	}
}

export const hasOne = (ForeignClass: () => { new(): unknown }, options: Options<BaseInterface, HasOne<BaseInterface>> = {}) => {
	return <TRecord extends BaseInterface>(target: TRecord, propertyKey: keyof TRecord) => {
		const Class = (target.class() as typeof Base)

		if (options.dependent) {
			HasOne.attachDependencyHandler(
				Class,
				options.dependent,
				propertyKey as string,
			)
		}

		Class.after("initialization", (instance) => {
			instance.__set__(propertyKey, new HasOne(propertyKey as string, instance, ForeignClass() as typeof Base, {
				foreignKey: `${pluralize.singular((target.class() as typeof Base).tableName)}_id`,
				...options,
				localKey: undefined,
			}))
		})
	}
}

export const hasMany = (ForeignClass: () => { new(): unknown }, options: Options<BaseInterface, HasOne<BaseInterface>> = {}) => {
	return <TRecord extends BaseInterface>(target: TRecord, propertyKey: keyof TRecord) => {
		const Class = (target.class() as typeof Base)

		if (options.dependent) {
			HasMany.attachDependencyHandler(
				Class,
				options.dependent,
				propertyKey as string,
			)
		}

		Class.after("initialization", (instance) => {
			instance.__set__(propertyKey, new HasMany(propertyKey as string, instance, ForeignClass() as typeof Base, {
				foreignKey: `${pluralize.singular((target.class() as typeof Base).tableName)}_id`,
				...options,
				localKey: undefined,
			}))
		})
	}
}
