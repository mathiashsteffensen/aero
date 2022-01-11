import bcrypt from "bcrypt"

import Base from "../Base"
import { AttributeDecorator } from "../types"

const encryptPassword = (key: string | symbol | number) => {
	return async <TRecord extends Base<TRecord>>(instance: TRecord) => {
		const password = instance.__send__(key) as string

		const passwordHash = await bcrypt.hash(password, await bcrypt.genSalt(12))

		instance.__set__(key, passwordHash)
	}
}
export const hasEncryptedPassword = (): AttributeDecorator => {
	return (target, key) => {
		const Class = target.class<typeof Base>()

		Class.before("create", encryptPassword(key))
		Class.before("update", encryptPassword(key))
	}
}
