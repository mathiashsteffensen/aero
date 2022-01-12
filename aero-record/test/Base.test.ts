import * as assert from "assert"

import AeroRecord from "../lib/AeroRecord"
import { ConstructorArgs, HookOptions, ModelMethods, QueryResult } from "../lib/types"

import BaseDummyModel from "./BaseDummyModel"

class DummyModel extends BaseDummyModel<DummyModel> {}

describe("Base", () => {
	afterEach(() => {
		DummyModel.reset()
	})

	describe(".tableName", () => {
		describe("with default table name", () => {
			it("converts the model name to snake_case and pluralizes it", () => {
				assert.equal(DummyModel.tableName, "dummy_models")
			})
		})

		describe("with custom table name", function () {
			class DummyModel extends AeroRecord.Base<DummyModel> {
				static tableName = "users"
			}

			it("uses the custom table name", () => {
				assert.equal(DummyModel.tableName, "users")
			})
		})
	})

	describe(".before", () => {
		it("doesn't throw an error", () => {
			assert.doesNotThrow(
				() => DummyModel.before<DummyModel>(
					"save",
					"setId",
					{ if: "isNewRecord" },
				),
			)
		})
	})

	describe(".after", () => {
		it("doesn't throw an error", () => {
			assert.doesNotThrow(
				() => DummyModel.after<DummyModel>(
					"save",
					"sendConfirmationEmail",
					{ if: "isNewRecord" },
				),
			)
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
				assert.equal(dummyModel.id, undefined)
			})
		})

		context("with params", () => {
			before(() => {
				params = { id: "Hello" }
			})

			it("sets the attributes", () => {
				assert.equal(dummyModel.id, "Hello")
			})
		})
	})

	describe(".findBy", () => {
		let params: ConstructorArgs<DummyModel>
		let result: QueryResult<DummyModel>

		const doFindBy = async () => result = await DummyModel.findBy<DummyModel>(params)

		beforeEach(async () => {
			DummyModel.before<DummyModel>("create", "setId")
		})

		context("when record doesn't exist in the database", () => {
			beforeEach(async () => {
				params = {
					id: (Math.random() * 2300).toString(),
				}
				await doFindBy()
			})

			it("returns undefined", () => {
				assert.equal(result, undefined)
			})
		})

		context("when record exists in the database", () => {
			beforeEach(async () => {
				const dummyModel: DummyModel = DummyModel.new()
				console.log("a",dummyModel)
				await dummyModel.save()

				console.log("b",dummyModel)

				params = {
					id: dummyModel.id,
				}
				await doFindBy()
			})

			it("doesn't return undefined", () => {
				assert.notEqual(result, undefined)
			})

			it("returns the preExistingModel", () => {
				assert.equal(result?.id, params.id)
			})
		})
	})

	describe("#callHooks", () => {
		let dummyModel: DummyModel
		let method: ModelMethods<DummyModel> | Array<ModelMethods<DummyModel>>
		let options: HookOptions<DummyModel>

		beforeEach(async () => {
			dummyModel = new DummyModel()
			DummyModel.before<DummyModel>("save", method, options)
			await dummyModel.callHooks("before", "save")
		})

		context("when a single hook is registered", () => {
			before(() => {
				method = "setId"
			})

			context("with no options", () => {
				before(() => {
					options = {}
				})

				it("calls the setId method", () => {
					assert.equal(dummyModel.calledSetId, 1)
					assert.equal(dummyModel.id, "an-id")
				})
			})

			context("using 'if' option", () => {
				context("when 'if' option evaluates to false", () => {
					before(() => {
						options = { if: "isPersisted" }
					})

					it("doesn't call the setId method", () => {
						assert.equal(dummyModel.calledSetId, 0)
						assert.equal(dummyModel.id, undefined)
					})
				})

				context("when 'if' option evaluates to true", () => {
					before(() => {
						options = { if: "isNewRecord" }
					})

					it("calls the setId method", () => {
						assert.equal(dummyModel.calledSetId, 1)
						assert.equal(dummyModel.id, "an-id")
					})
				})
			})

			context("using 'unless' option", () => {
				context("when 'unless' option evaluates to true", () => {
					before(() => {
						options = { unless: "isNewRecord" }
					})

					it("doesn't call the setId method", () => {
						assert.equal(dummyModel.calledSetId, 0)
						assert.equal(dummyModel.id, undefined)
					})
				})

				context("when 'unless' option evaluates to false", () => {
					before(() => {
						options = { unless: "isPersisted" }
					})

					it("calls the setId method", () => {
						assert.equal(dummyModel.calledSetId, 1)
						assert.equal(dummyModel.id, "an-id")
					})
				})
			})
		})

		context("when multiple hooks are registered", () => {
			before(() => {
				method = ["setId", "sendConfirmationEmail"]
			})

			context("with no options", () => {
				before(() => {
					options = {}
				})

				it("calls the setId method", () => {
					assert.equal(dummyModel.calledSetId, 1)
					assert.equal(dummyModel.id, "an-id")
				})

				it("calls the sendConfirmationEmail method", () => {
					assert.equal(dummyModel.calledSendConfirmationEmail, 1)
				})
			})

			context("using 'if' option", () => {
				context("when 'if' option evaluates to false", () => {
					before(() => {
						options = { if: "isPersisted" }
					})

					it("doesn't call the setId method", () => {
						assert.equal(dummyModel.calledSetId, 0)
						assert.equal(dummyModel.id, undefined)
					})

					it("doesn't call the sendConfirmationEmail method", () => {
						assert.equal(dummyModel.calledSendConfirmationEmail, 0)
					})
				})

				context("when 'if' option evaluates to true", () => {
					before(() => {
						options = { if: "isNewRecord" }
					})

					it("calls the setId method", () => {
						assert.equal(dummyModel.calledSetId, 1)
						assert.equal(dummyModel.id, "an-id")
					})

					it("calls the sendConfirmationEmail method", () => {
						assert.equal(dummyModel.calledSendConfirmationEmail, 1)
					})
				})
			})

			context("using 'unless' option", () => {
				context("when 'unless' option evaluates to true", () => {
					before(() => {
						options = { unless: "isNewRecord" }
					})

					it("doesn't call the setId method", () => {
						assert.equal(dummyModel.calledSetId, 0)
						assert.equal(dummyModel.id, undefined)
					})

					it("doesn't call the sendConfirmationEmail method", () => {
						assert.equal(dummyModel.calledSendConfirmationEmail, 0)
					})
				})

				context("when 'unless' option evaluates to false", () => {
					before(() => {
						options = { unless: "isPersisted" }
					})

					it("calls the setId method", () => {
						assert.equal(dummyModel.calledSetId, 1)
						assert.equal(dummyModel.id, "an-id")
					})

					it("calls the sendConfirmationEmail method", () => {
						assert.equal(dummyModel.calledSendConfirmationEmail, 1)
					})
				})
			})
		})
	})

	describe("#save", () => {
		let dummyModel: DummyModel
		let attributes: ConstructorArgs<DummyModel>

		beforeEach(async () => {
			DummyModel.before<DummyModel>("create", "setId")
			DummyModel.before<DummyModel>("create", "sendConfirmationEmail")
			DummyModel.before<DummyModel>("update", "sendConfirmationEmail")

			dummyModel = DummyModel.new(attributes)
			await dummyModel.save()
		})

		context("when model hasn't been saved to the database yet", () => {
			it("sets isPersisted to true", () => {
				assert.equal(dummyModel.isPersisted, true)
			})

			it("calls the before create hooks", () => {
				assert.equal(dummyModel.calledSetId, 1)
				assert.equal(dummyModel.calledSendConfirmationEmail, 1)
			})

			it("sets updated_at and created_at", () => {
				assert.equal(dummyModel.createdAt instanceof Date, true)
			})
		})

		context("when model has already been saved to the database", () => {
			beforeEach(async () => {
				dummyModel.id = "new-id"
				await dummyModel.save()
			})

			it("isPersisted is still true", () => {
				assert.equal(dummyModel.isPersisted, true)
			})

			it("calls the before update hook", () => {
				assert.equal(dummyModel.calledSendConfirmationEmail, 2)
			})

			it("doesn't call the before/after create hooks again", () => {
				assert.equal(dummyModel.calledSetId, 1)
			})
		})
	})
})
