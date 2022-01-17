import AeroRecord from "../lib/AeroRecord"
import Base from "../lib/Base"

export default class BaseDummyModel<TRecord extends Base<TRecord>> extends AeroRecord.Base<BaseDummyModel<TRecord>> {
	id!: string

	createdAt?: Date
	updatedAt?: Date

	name?: string
	email?: string

	@AeroRecord.Decorators.hasEncryptedPassword()
		password?: string

	calledSetId = 0
	@AeroRecord.Decorators.before("create")
	setId() {
		this.id = "an-id"
		this.calledSetId += 1
	}

	calledSendConfirmationEmail = 0
	sendConfirmationEmail() {
		return new Promise(resolve => setTimeout(() => {
			this.calledSendConfirmationEmail += 1
			resolve(undefined)
		}, 20))
	}
}
