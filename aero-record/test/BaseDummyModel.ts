import AeroRecord from "../lib/AeroRecord"
import Hooks from "../lib/Hooks"
import Base from "../lib/Base"

export default class BaseDummyModel<TRecord extends Base<TRecord>> extends AeroRecord.Base<TRecord> {
	id!: string
	name?: string
	email?: string
	password?: string

	calledSetId = 0
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

	static reset() {
		this.hooks = new Hooks()
	}
}
