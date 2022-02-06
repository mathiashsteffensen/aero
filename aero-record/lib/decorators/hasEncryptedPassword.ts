import bcrypt from "bcrypt"

import Base from "../Base"

const encryptPassword = (key: string | symbol | number) => {
	return async <TRecord extends Base<TRecord>>(instance: TRecord) => {
		const password = (instance.__send__(key) || "") as string

		const passwordHash = await bcrypt.hash(password, await bcrypt.genSalt(12))

		instance.__set__(key, passwordHash)
	}
}
export const hasEncryptedPassword = (): PropertyDecorator => {
	return (target, attribute) => {
		const Class = target.constructor as typeof Base

		Class.before("create", encryptPassword(attribute))
		Class.before(
			"update",
			encryptPassword(attribute),
			{
				if: (record) => record.attributeChanged(attribute as string),
			},
		)
	}
}
