import { expect } from "chai"

import Hooks from "../lib/Hooks"
import { HookOptions, ModelMethods } from "../lib/types"
import Base from "../lib/Base"

describe("AeroRecord", () => {
	describe(".Base", () => {
		describe("#hooks", () => {
			let hooks: Hooks

			beforeEach(() => hooks = new Hooks())

			describe("#callHooks", () => {
				class Dummy extends Base<Dummy> {
					calledSetId = 0
					setId() {
						this.calledSetId +=1
					}

					calledSendConfirmationEmail = 0
					sendConfirmationEmail() {
						this.calledSendConfirmationEmail +=1
					}
				}
				let dummyModel: Dummy
				let method: ModelMethods<typeof dummyModel> | Array<ModelMethods<typeof dummyModel>>
				let options: HookOptions<typeof dummyModel>

				beforeEach(async () => {
					dummyModel = Dummy.new<Dummy>()

					hooks.before("save", method, options)

					await hooks.callHooks(dummyModel)("before", "save")
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
							expect(dummyModel.calledSetId).to.eq(1)
						})
					})

					context("using 'if' option", () => {
						context("when 'if' option evaluates to false", () => {
							before(() => {
								options = { if: "isPersisted" }
							})

							it("doesn't call the setId method", () => {
								expect(dummyModel.calledSetId).to.eq(0)
							})
						})

						context("when 'if' option evaluates to true", () => {
							before(() => {
								options = { if: "isNewRecord" }
							})

							it("calls the setId method", () => {
								expect(dummyModel.calledSetId).to.eq(1)
							})
						})
					})

					context("using 'unless' option", () => {
						context("when 'unless' option evaluates to true", () => {
							before(() => {
								options = { unless: "isNewRecord" }
							})

							it("doesn't call the setId method", () => {
								expect(dummyModel.calledSetId).to.eq(0)
							})
						})

						context("when 'unless' option evaluates to false", () => {
							before(() => {
								options = { unless: "isPersisted" }
							})

							it("calls the setId method", () => {
								expect(dummyModel.calledSetId).to.eq(1)
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
							expect(dummyModel.calledSetId).to.eq(1)
						})

						it("calls the sendConfirmationEmail method", () => {
							expect(dummyModel.calledSendConfirmationEmail).to.eq(1)
						})
					})

					context("using 'if' option", () => {
						context("when 'if' option evaluates to false", () => {
							before(() => {
								options = { if: "isPersisted" }
							})

							it("doesn't call the setId method", () => {
								expect(dummyModel.calledSetId).to.eq(0)
							})

							it("doesn't call the sendConfirmationEmail method", () => {
								expect(dummyModel.calledSendConfirmationEmail).to.eq(0)
							})
						})

						context("when 'if' option evaluates to true", () => {
							before(() => {
								options = { if: "isNewRecord" }
							})

							it("calls the setId method", () => {
								expect(dummyModel.calledSetId).to.eq(1)
							})

							it("calls the sendConfirmationEmail method", () => {
								expect(dummyModel.calledSendConfirmationEmail).to.eq(1)
							})
						})
					})

					context("using 'unless' option", () => {
						context("when 'unless' option evaluates to true", () => {
							before(() => {
								options = { unless: "isNewRecord" }
							})

							it("doesn't call the setId method", () => {
								expect(dummyModel.calledSetId).to.eq(0)
							})

							it("doesn't call the sendConfirmationEmail method", () => {
								expect(dummyModel.calledSendConfirmationEmail).to.eq(0)
							})
						})

						context("when 'unless' option evaluates to false", () => {
							before(() => {
								options = { unless: "isPersisted" }
							})

							it("calls the setId method", () => {
								expect(dummyModel.calledSetId).to.eq(1)
							})

							it("calls the sendConfirmationEmail method", () => {
								expect(dummyModel.calledSendConfirmationEmail).to.eq(1)
							})
						})
					})
				})
			})
		})
	})
})
