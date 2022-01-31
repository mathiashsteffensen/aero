import AeroRecord from "../../lib/AeroRecord"
import { ConstructorArgs } from "../../lib/types"
import { expect } from "chai"

class DummyModel extends AeroRecord.Base<DummyModel> {
	@AeroRecord.Decorators.validates({
		unique: true,
	})
		email!: string

@AeroRecord.Decorators.validates({
	present: true,
})
	password!: string
}

describe("AeroRecord", () => {
	describe(".Decorators", () => {
		describe(".validates", () => {
			let params: ConstructorArgs<DummyModel>
			let record: DummyModel

			/* eslint-disable @typescript-eslint/no-empty-function */
			let doBefore = async () => {}
			/* eslint-enable @typescript-eslint/no-empty-function */

			beforeEach(async () => {
				await doBefore()

				record = DummyModel.new(params)

				await record.validate()
			})

			describe("present: true", () => {
				context("when attribute is not present", () => {
					before(() => {
						params = {}
					})

					it("registers an error", () => {
						expect(record.errors.get("password")?.length).to.eq(1)
					})
				})

				context("when attribute is present", () => {
					before(() => {
						params = {
							email: Math.random().toString(),
							password: "password",
						}
					})

					it("doesn't register an error", () => {
						expect(record.errors.get("password")).to.be.undefined
					})
				})
			})

			describe("unique: true", () => {
				context("when attribute is not present", () => {
					before(() => {
						params = {}
					})

					it("registers an error", () => {
						expect(record.errors.get("email")?.length).to.eq(1)
					})
				})
			})

			context("when attribute is present", () => {
				before(() => {
					params = {
						email: "ms@aero.io",
					}
				})

				context("when email is unique", () => {
					before(() => {
						doBefore = async () => {
							await DummyModel
								.all<DummyModel>()
								.then(
									(records) => records.map(
										(record) => record.destroy(),
									),
								)
						}
					})

					it("doesn't register an error", () => {
						expect(record.errors.get("email")).to.be.undefined
					})
				})

				context("when email is already in use", () => {
					before(() => {
						doBefore = async () => {
							await DummyModel.new({
								id: "1",
								email: "ms@aero.io",
								password: "password",
							}).save({ throwOnError: true })
						}
					})

					it("registers an error", () => {
						expect(record.errors.get("email")?.length).to.eq(1)
					})
				})
			})
		})
	})
})
