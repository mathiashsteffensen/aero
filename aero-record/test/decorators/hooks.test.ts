import { expect } from "chai"

import BaseDummyModel  from "../BaseDummyModel"

describe("AeroRecord", () => {
	describe(".Decorators", () => {
		describe(".before", () => {
			class DummyModel extends BaseDummyModel<DummyModel> {}

			context("when creating", () => {
				let dummyModel: DummyModel

				beforeEach(async () => {
					dummyModel = DummyModel.new()
					await dummyModel.save()
				})

				it("calls the create hook", () => {
					expect(dummyModel.calledSetId).to.eq(1)
				})
			})
		})
	})
})
