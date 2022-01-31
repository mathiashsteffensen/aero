import Base from "../Base"
import Validator from "../model/Validator"

import { ValidatorOptions } from "../types"

export const validates = (options: ValidatorOptions): PropertyDecorator => {
	return (target, key) => {
		const Class = target.constructor as typeof Base

		if (Class.validators.length === 0) {
			Class.validators = []
		}

		Class.validators.push(new Validator(<string>key, options))
	}
}
