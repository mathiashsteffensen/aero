import { expect } from "chai"

import AeroRecord, { hasOne } from "../../lib/AeroRecord"
import HasOne from "../../lib/Relations/HasOne"

import { ConstructorArgs } from "../../lib/types"

import BaseDummyModel from "../BaseDummyModel"

class DummyModel extends BaseDummyModel<DummyModel>{
	userId?: string
}

class User extends AeroRecord.Base<User> {
	id!: string
	createdAt?: Date
	updatedAt?: Date

@hasOne(DummyModel, { optional: true })
	dummy!: HasOne<DummyModel>
}

describe("AeroRecord", () => {
	describe("Relations", () => {
		describe("HasOne", () => {
			let user: User

			beforeEach(async () => {
				user = await User.create({
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
		})
	})
})
