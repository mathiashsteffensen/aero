import Base from "../Base"
import Validator from "../Validator"

import { AttributeDecorator, ValidatorOptions } from "../types"

export const validates = (options: ValidatorOptions): AttributeDecorator => {
	return (target, key) => {
		const Class = target.class<typeof Base>()

		Class.validators.push(new Validator(Class, <string>key, options))
	}
}
