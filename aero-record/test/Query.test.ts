import BaseDummyModel from "./BaseDummyModel"
import Query from "../lib/Query"
import Base from "../lib/Base"
import { expect } from "chai"

class DummyModel extends BaseDummyModel<DummyModel> {}

describe("Query", () => {
	let query: Query<DummyModel>
	beforeEach(() => {
		query = new Query(DummyModel as typeof Base, DummyModel.tableName)
	})

	describe("#exists", () => {
		let beforeQuery: (() => Promise<void>) | undefined
		let result: boolean

		beforeEach(async () => {
			await beforeQuery?.()

			result = await query.where({ email: "ms@aero.io" }).exists()
		})

		context("when no record exists", () => {
			it("returns false", () => {
				expect(result).to.be.false
			})
		})

		context("when record exists", () => {
			before(() => {
				beforeQuery = async () => {
					await DummyModel.create<DummyModel>({
						email: "ms@aero.io",
						password: "password",
					}, { throwOnError: true })
				}
			})

			it("returns true", () => {
				expect(result).to.be.true
			})
		})
	})
})
