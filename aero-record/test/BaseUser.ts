import AeroRecord from "../lib/AeroRecord"

export default class BaseUser extends AeroRecord.Base<BaseUser> {
	static get tableName() {
		return "users"
	}

	id!: string
	createdAt?: Date
	updatedAt?: Date
}
