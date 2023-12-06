import cuid from "cuid"

import AeroRecord, { hasEncryptedPassword, beforeCreate } from "../lib/AeroRecord"

export default class BaseDummyModel<TRecord extends BaseDummyModel<TRecord>> extends AeroRecord.Base<TRecord> {
	static get tableName() {
		return "dummy_models"
	}

	id!: string

	createdAt?: Date
	updatedAt?: Date

	name?: string
	email?: string

	@hasEncryptedPassword()
		password?: string

	calledSetId = 0
	@beforeCreate()
	async setId() {
		this.id = cuid()
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
