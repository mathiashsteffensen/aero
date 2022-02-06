import { expect } from "chai"

import AeroRecord, { belongsTo } from "../lib/AeroRecord"
import BelongsTo from "../lib/BelongsTo"
import BaseDummyModel from "./BaseDummyModel"
import { ConstructorArgs } from "../lib/types"

class BaseRecord<TRecord extends BaseRecord<TRecord>> extends AeroRecord.Base<TRecord> {}

class User extends BaseRecord<User> {
	id!: string
	createdAt?: Date
	updatedAt?: Date
}

class DummyModel<TRecord extends DummyModel<TRecord>> extends BaseDummyModel<TRecord>{
	userId?: string
}

class OptionalDummyModel extends DummyModel<OptionalDummyModel> {
	@belongsTo(User, { optional: true })
		user!: BelongsTo<User>
}

class NotOptionalDummyModel extends DummyModel<OptionalDummyModel> {
	@belongsTo(User)
		user!: BelongsTo<User>
}

describe("AeroRecord", () => {
	describe(".BelongsTo", () => {
		let Class: typeof OptionalDummyModel | typeof NotOptionalDummyModel
		let dummyModel: OptionalDummyModel | NotOptionalDummyModel

		describe("#then", () => {
			let beforeCreate: (() => Promise<void>) | undefined

			beforeEach(async () => {
				await beforeCreate?.call(this)
				dummyModel = await Class.create<OptionalDummyModel | NotOptionalDummyModel>({
					name: "Mathias",
					email: "ms@aero.io",
					password: "password",
					userId: "user_id",
				}) as unknown as OptionalDummyModel | NotOptionalDummyModel
			})

			context("when relation is optional", () => {
				before(() => {
					Class = OptionalDummyModel
				})

				context("when DummyModel has a related model", () => {
					let user: User

					before(() => {
						beforeCreate = async () => {
							user = await User.create({
								id: "user_id",
							}, { throwOnError: true })
						}
					})

					it("returns the related model", async () => {
						expect((await dummyModel.user)?.toObject()).to.deep.eq(user.toObject())
					})
				})

				context("when DummyModel doesn't have a related model", () => {
					before(() => beforeCreate = undefined)

					it("returns undefined", async () => {
						expect(await dummyModel.user).to.be.undefined
					})
				})
			})

			context("when relation is not optional", () => {
				before(() => {
					Class = NotOptionalDummyModel
				})

				context("when DummyModel has a related model", () => {
					let user: User

					before(() => {
						beforeCreate = async () => {
							user = await User.create({
								id: "user_id",
							}, { throwOnError: true })
						}
					})

					it("returns the related model", async () => {
						expect(await dummyModel.user).to.deep.eq(user)
					})
				})

				context("when DummyModel doesn't have a related model", () => {
					before(() => beforeCreate = undefined)

					it("throws an error", async () => {
						expect(async () => await dummyModel.user).to.throw
					})
				})
			})
		})

		describe("#create", () => {
			const params: ConstructorArgs<User> = {
				id: "user_id",
			}
			let user: User

			beforeEach(async () => {
				dummyModel = await OptionalDummyModel.create<OptionalDummyModel>({
					name: "Mathias",
					email: "ms@aero.io",
					password: "password",
				}, { throwOnError: true }) as unknown as OptionalDummyModel

				user = await dummyModel.user.create(params, { throwOnError: true })

				await dummyModel.reload()
			})

			it("persists the new user", () => {
				expect(user.isPersisted).to.be.true
			})

			it("sets the key on the model", () => {
				expect(dummyModel.userId).to.eq(user.id)
			})

			it("sets the relation on the model", async () => {
				expect(await dummyModel.user).to.deep.eq(user)
			})
		})
	})
})
