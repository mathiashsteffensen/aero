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
	async setId() {
		this.id = "an-id"
		this.calledSetId += 1
		await this.sleep(10)

	}

	calledSendConfirmationEmail = 0
	async sendConfirmationEmail() {
		this.calledSendConfirmationEmail += 1
		await this.sleep(10)
	}

	sleep(ms = 0) {
		return new Promise<void>(resolve => setTimeout(resolve, ms))
	}
}
