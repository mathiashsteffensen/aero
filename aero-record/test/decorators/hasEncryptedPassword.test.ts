import * as assert from "assert"

import BaseDummyModel  from "../BaseDummyModel"

describe("AeroRecord", () => {
	describe(".Decorators", () => {
		describe(".hasEncryptedPassword", () => {
			class DummyModel extends BaseDummyModel<DummyModel> {}

			context("when creating a record", () => {
				const dummyModel = DummyModel.new<DummyModel>({
					email: "mathias@booktid.net",
					password: "password",
				})

				beforeEach(async () => {
					dummyModel.setId()
					await dummyModel.save()
				})

				it("hashes the password", () => {
					assert.notEqual(dummyModel.password, "password")
				})
			})

			context("when updating the password", () => {
				const dummyModel = DummyModel.new<DummyModel>({
					email: "mathias@booktid.net",
					password: "password",
				})

				beforeEach(async () => {
					dummyModel.setId()
					await dummyModel.save()

					dummyModel.password = "new-password"
					await dummyModel.save()
				})

				it("hashes the password", () => {
					assert.notEqual(dummyModel.password, "new-password")
				})
			})

			context("when updating, but not the password", () => {
				const dummyModel = DummyModel.new<DummyModel>({
					email: "mathias@booktid.net",
					password: "password",
				})

				let passwordBefore: string
				let passwordAfter: string

				beforeEach(async () => {
					dummyModel.setId()
					await dummyModel.save()

					passwordBefore = dummyModel.password as string

					dummyModel.email = "newName@booktid.net"
					await dummyModel.save()

					passwordAfter = dummyModel.password as string
				})

				it("doesn't hash the password", () => {
					assert.equal(passwordBefore, passwordAfter)
				})
			})
		})
	})
})
