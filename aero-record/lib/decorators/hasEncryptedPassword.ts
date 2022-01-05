import bcrypt from "bcrypt"

import Base from "../Base"
import { AttributeDecorator } from "../types"

export const hasEncryptedPassword = (): AttributeDecorator => {
	return (target, key) => {
		const Record = (target.constructor as typeof Base)

		Record.before("create", async (instance) => {
			const password = instance.__send__(key) as string

			const passwordHash = await bcrypt.hash(password, await bcrypt.genSalt(12))

			instance.__set__(key, passwordHash)
		})
	}
}
