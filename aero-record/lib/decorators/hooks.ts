import Base from "../Base"

import { HookType, ModelMethods } from "../types"

export const before = (event: HookType): MethodDecorator => {
	return (target, propertyKey) => {
		const Class = (target.constructor as typeof Base)

		Class.hooks.before(event, propertyKey as ModelMethods<unknown>)
	}
}

export const after = (event: HookType): MethodDecorator => {
	return (target, propertyKey) => {
		const Class = (target.constructor as typeof Base)

		Class.hooks.after(event, propertyKey as ModelMethods<unknown>)
	}
}
