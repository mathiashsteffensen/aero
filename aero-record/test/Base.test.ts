import { expect } from "chai"

import AeroRecord from "../lib/AeroRecord"
import { ConstructorArgs, QueryResult } from "../lib/types"

import BaseDummyModel from "./BaseDummyModel"

class DummyModel extends BaseDummyModel<DummyModel> {}

describe("Base", () => {
	describe(".tableName", () => {
		describe("with default table name", () => {
			it("converts the model name to snake_case and pluralizes it", () => {
				expect(DummyModel.tableName).to.eq("dummy_models")
			})
		})

		describe("with custom table name", function () {
			class DummyModel extends AeroRecord.Base<DummyModel> {
				static tableName = "users"
			}

			it("uses the custom table name", () => {
				expect(DummyModel.tableName).to.eq("users")
			})
		})
	})

	describe(".new", () => {
		let params: ConstructorArgs<DummyModel>
		let dummyModel: DummyModel

		beforeEach(() => {
			dummyModel = DummyModel.new(params)
		})

		context("with no params", () => {
			it("leaves the attributes undefined", () => {
				expect(dummyModel.id).to.be.undefined
			})
		})

		context("with params", () => {
			before(() => {
				params = { id: "Hello" }
			})

			it("sets the attributes", () => {
				expect(dummyModel.id).to.eq("Hello")
			})
		})
	})

	describe(".findBy", () => {
		let params: ConstructorArgs<DummyModel>
		let result: QueryResult<DummyModel>

		const doFindBy = async () => result = await DummyModel.findBy<DummyModel>(params)

		context("when record doesn't exist in the database", () => {
			beforeEach(async () => {
				params = {
					id: (Math.random() * 2300).toString(),
				}
				await doFindBy()
			})

			it("returns undefined", () => {
				expect(result).to.be.undefined
			})
		})

		context("when record exists in the database", () => {
			beforeEach(async () => {
				const dummyModel: DummyModel = DummyModel.new({ id: "an-id" })
				await dummyModel.save({ throwOnError: true })

				params = {
					id: dummyModel.id,
				}

				await doFindBy()
			})

			it("doesn't return undefined", () => {
				expect(result).not.to.be.undefined
			})

			it("returns the preExistingModel", () => {
				expect(result?.id).to.eq(params.id)
			})
		})
	})

	describe("#save", () => {
		let dummyModel: DummyModel
		let attributes: ConstructorArgs<DummyModel>

		beforeEach(async () => {
			dummyModel = DummyModel.new(attributes)
			await dummyModel.save()
		})

		context("when model hasn't been saved to the database yet", () => {
			before(() => {
				attributes = { id: "an-id" }
			})

			it("sets isPersisted to true", () => {
				expect(dummyModel.isPersisted).to.eq(true)
			})

			it("sets updated_at and created_at", () => {
				expect(dummyModel.createdAt).to.be.instanceof(Date)
				expect(dummyModel.updatedAt).to.be.instanceof(Date)
			})
		})

		context("when model has already been saved to the database", () => {
			beforeEach(async () => {
				dummyModel.email = "email@email.com"
				await dummyModel.save()
			})

			it("updates the record", () => {
				expect(dummyModel.email).to.eq("email@email.com")
			})

			it("updates the updated_at timestamp", () => {
				expect(dummyModel.updatedAt?.getTime()).not.to.eq(dummyModel.createdAt?.getTime())
			})

			it("still has isPersisted set to true", () => {
				expect(dummyModel.isPersisted).to.eq(true)
			})
		})
	})
})
