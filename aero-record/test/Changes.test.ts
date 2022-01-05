import * as assert from "assert"

import BaseDummyModel from "./BaseDummyModel"

class DummyModel extends BaseDummyModel<DummyModel> {}

describe("Changes", () => {
	const dummyModel = DummyModel.new<DummyModel>()

	beforeEach(() => {
		dummyModel.id = "an-id"
	})

	it("records the changes", () => {
		assert.equal(dummyModel.attributeChanged("id"), true)
	})

	context("when changed back", () => {
		beforeEach(() => {
			dummyModel.id = undefined as unknown as string
		})

		it("discards the changes", () => {
			assert.equal(dummyModel.attributeChanged("id"), false)
		})
	})

	context("when saved", () => {
		beforeEach(async () => {
			dummyModel.password = "password"
			await dummyModel.save()
		})

		it("resets the changes", () => {
			assert.equal(dummyModel.attributeChanged("password"), false)
		})

		context("when changed again", () => {
			beforeEach(() => {
				dummyModel.password = "new-password"
			})

			it("records the changes", () => {
				assert.equal(dummyModel.attributeChanged("password"), true)
			})
		})
	})
})
