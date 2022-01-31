import { expect } from "chai"

import BaseDummyModel  from "../BaseDummyModel"
import bcrypt from "bcrypt"

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
					await dummyModel.setId()
					await dummyModel.save()
				})

				it("hashes the password", async () => {
					expect(dummyModel.password).not.to.eq("password")
					expect(
						await bcrypt.compare(
							"password",
							dummyModel.password || "",
						),
					).to.be.true
				})
			})

			context("when updating the password", () => {
				const dummyModel = DummyModel.new<DummyModel>({
					email: "mathias@booktid.net",
					password: "password",
				})

				beforeEach(async () => {
					await dummyModel.setId()
					await dummyModel.save()

					dummyModel.password = "new-password"
					await dummyModel.save()
				})

				it("hashes the password", async () => {
					expect(dummyModel.password).not.to.eq("new-password")
					expect(
						await bcrypt.compare(
							"new-password",
							dummyModel.password || "",
						),
					).to.be.true
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
					await dummyModel.setId()
					await dummyModel.save()

					passwordBefore = dummyModel.password as string

					dummyModel.email = "newName@booktid.net"
					await dummyModel.save()

					passwordAfter = dummyModel.password as string
				})

				it("doesn't hash the password again", async () => {
					expect(passwordBefore).to.eq(passwordAfter)
					expect(
						await bcrypt.compare(
							"password",
							passwordAfter,
						),
					).to.be.true
				})
			})
		})
	})
})
