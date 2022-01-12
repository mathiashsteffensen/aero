import * as assert from "assert"

import AeroRecord from "../../lib/AeroRecord"

import BaseDummyModel  from "../BaseDummyModel"

class DummyModel extends BaseDummyModel<DummyModel> {
	@AeroRecord.Decorators.hasEncryptedPassword()
	declare password: string
}

describe("Decorators", () => {
	describe(".hasEncryptedPassword", () => {
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

				passwordBefore = dummyModel.password

				dummyModel.email = "newName@booktid.net"
				await dummyModel.save()

				passwordAfter = dummyModel.password
			})

			it("doesn't hash the password", () => {
				assert.equal(passwordBefore, passwordAfter)
			})
		})
	})
})
