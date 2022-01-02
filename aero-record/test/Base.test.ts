import * as assert from "assert"

import AeroRecord from "../lib/AeroRecord"
import { ConstructorArgs, HookOptions, ModelMethods } from "../lib/types"
import Hooks from "../lib/Hooks"

class DummyModel extends AeroRecord.Base<DummyModel> {
	id!: string
	name?: string
	email?: string

	calledSetId = 0
	setId() {
		this.id = "an-id"
		this.calledSetId += 1
	}

	calledSendConfirmationEmail = 0
	sendConfirmationEmail() {
		return new Promise(resolve => setTimeout(() => {
			this.calledSendConfirmationEmail += 1
			resolve(undefined)
		}, 20))
	}

	static reset() {
		this.hooks = new Hooks()
	}
}

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

	describe(".constructor", () => {
		let params: ConstructorArgs<DummyModel>
		let dummyModel: DummyModel

		beforeEach(() => {
			dummyModel = new DummyModel(params)
		})

		describe("with no params", () => {
			it("leaves the attributes undefined", () => {
				assert.equal(dummyModel.id, undefined)
			})
		})
	})

	describe("#callHooks", () => {
		let dummyModel: DummyModel
		let method: ModelMethods<DummyModel> | Array<ModelMethods<DummyModel>>
		let options: HookOptions<keyof DummyModel>

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
			DummyModel.after<DummyModel>("create", "sendConfirmationEmail")
			DummyModel.after<DummyModel>("update", "sendConfirmationEmail")

			dummyModel = new DummyModel(attributes)
			await dummyModel.save()
		})

		context("when model hasn't been saved to the database yet", () => {
			it("sets isPersisted to true", () => {
				assert.equal(dummyModel.isPersisted, true)
			})

			it("calls the before/after create hooks", () => {
				assert.equal(dummyModel.calledSetId, 1)
				assert.equal(dummyModel.calledSendConfirmationEmail, 1)
			})
		})

		context("when model has already been saved to the database", () => {
			beforeEach(async () => {
				await dummyModel.save()
			})

			it("isPersisted is still true", () => {
				assert.equal(dummyModel.isPersisted, true)
			})

			it("calls the after update hook", () => {
				assert.equal(dummyModel.calledSendConfirmationEmail, 2)
			})

			it("doesn't call the before/after create hooks again", () => {
				assert.equal(dummyModel.calledSetId, 1)
			})
		})
	})
})
