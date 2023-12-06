import { expect } from "chai"

import AeroRecord, { hasOne } from "../../lib/AeroRecord"
import HasOne from "../../lib/Relations/HasOne"

import { ConstructorArgs } from "../../lib/types"

import BaseDummyModel from "../BaseDummyModel"
import BaseUser from "../BaseUser"

class DummyModel extends BaseDummyModel<DummyModel>{
	userId?: string
}

class User extends BaseUser {
@hasOne(() => DummyModel, { optional: true })
	dummy!: HasOne<DummyModel>
}

class UserDependentDestroy extends BaseUser {
@hasOne(() => DummyModel, { optional: true, dependent: "destroy" })
	dummy!: HasOne<DummyModel>
}
class UserDependentRestrict extends BaseUser {
@hasOne(() => DummyModel, { optional: true, dependent: "restrictWithError" })
	dummy!: HasOne<DummyModel>
}

describe("AeroRecord", () => {
	describe("Relations", () => {
		describe("HasOne", () => {
			let UserClass: typeof User | typeof UserDependentDestroy | typeof UserDependentRestrict
			let user: User

			before(() => {
				UserClass = User
			})

			beforeEach(async () => {
				user = await UserClass.create({
					id: "this-is-the-user-id",
				})
			})

			describe("#then", () => {
				context("when related model exists", () => {
					beforeEach(async () => {
						await DummyModel.create<DummyModel>({
							email: "ms@aero.io",
							name: "Mathias",
							password: "password",
							userId: user.id,
						})
					})

					it("returns the related model", async () => {
						expect((await user.dummy)?.email).to.deep.eq("ms@aero.io")
					})
				})

				context("when related model doesn't exist", () => {
					it("returns undefined", async () => {
						expect(await user.dummy).to.be.undefined
					})
				})
			})

			describe("#create", () => {
				let dummyModel: DummyModel
				let params: ConstructorArgs<DummyModel>

				beforeEach(async () => {
					dummyModel = await user.dummy.create(params, { throwOnError: true })
				})

				it("creates a model with the right foreign key", () => {
					expect(dummyModel.userId).to.eq(user.id)
				})
			})

			describe("#destroy", () => {
				let dummyModel: DummyModel

				beforeEach(async () => {
					dummyModel = await user.dummy.create({}, { throwOnError: true })
				})

				context("without dependency option", () => {
					beforeEach(async () => {
						AeroRecord.logger.debug()
						console.log(await user.dummy)
						await user.destroy()
						await dummyModel.reload()
						console.log(await user.dummy)
					})

					it("destroys the user", () => {
						expect(user.isPersisted).to.be.false
					})

					it("doesn't destroy the relation", () => {
						expect(dummyModel.isPersisted).to.be.true
					})
				})

				context("when dependency option is set to 'destroy'", () => {
					before(() => {
						UserClass = UserDependentDestroy
					})

					beforeEach(async () => {
						await user.destroy()
						await dummyModel.reload()
					})

					it("destroys the user", () => {
						expect(user.isPersisted).to.be.false
					})

					it("destroys the relation", () => {
						expect(dummyModel.isPersisted).to.be.false
					})
				})

				context("when dependency option is set to 'restrictWithError'", () => {
					before(() => {
						UserClass = UserDependentRestrict
					})

					const swallowError = async () => {
						try {
							await user.destroy()
							// eslint-disable-next-line no-empty
						} catch (_) {}
						await user.reload()
						await dummyModel.reload()
					}

					it("throws an error", () => {
						expect(() => user.destroy()).to.throw
					})

					it("doesn't destroy the user", async () => {
						await swallowError()
						expect(user.isPersisted).to.be.true
					})

					it("doesn't destroy the relation", async () => {
						await swallowError()
						expect(dummyModel.isPersisted).to.be.true
					})
				})
			})
		})
	})
})
