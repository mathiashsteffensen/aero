import Base from "../Base"

import { ModelMethods } from "../types"
import { HookType } from "../model/Hooks"

export const before = (event: HookType): MethodDecorator => {
	return (target, propertyKey) => {
		const Class = (target.constructor as typeof Base)

		Class.before(event, propertyKey as ModelMethods<unknown>)
	}
}

export const beforeSave = () => before("save")
export const beforeCreate = () => before("create")
export const beforeUpdate = () => before("update")
export const beforeValidation = () => before("validation")
export const beforeDestroy = () => before("destroy")

export const after = (event: HookType): MethodDecorator => {
	return (target, propertyKey) => {
		const Class = (target.constructor as typeof Base)

		Class.after(event, propertyKey as ModelMethods<unknown>)
	}
}

export const afterSave = () => after("save")
export const afterCreate = () => after("create")
export const afterUpdate = () => after("update")
export const afterValidation = () => after("validation")
export const afterDestroy = () => after("destroy")
