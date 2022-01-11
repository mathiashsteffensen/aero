import { fastify } from "fastify"

import Parameters from "../lib/Parameters"
import * as assert from "assert"
import { ParameterValidationError } from "../lib/Errors"

describe("Parameters", () => {
	let serverParams: Parameters
	let clientParams: Record<string, unknown>
	const server = fastify({
		logger: false,
	})

	server.post("/hello", (req, res) => {
		serverParams = new Parameters(req)
		res.send("world")
	})

	beforeEach(async () => {
		await server.inject({
			method: "POST",
			path: "/hello",
			payload: clientParams,
		})
	})

	describe("#validate", () => {
		const testValidate = (required: boolean) => {
			context(`when parameters are ${required ? "" : "not "}required`, () => {
				context("when object isn't nested", () => {
					before(() => {
						clientParams = {
							name: "Mathias",
							email: "mathias@aerojs.io",
						}
					})

					context("when using a correctly matching schema", () => {
						const doValidate = () => {
							serverParams.validate<{ name: string, email: string }>({ name: { type: "string", required }, email: { type: "string", required } })
						}

						it("doesn't throw an error", () => {
							assert.doesNotThrow(doValidate, ParameterValidationError)
						})
					})

					context("when using an incorrectly matching schema", () => {
						const doValidate = () => {
							serverParams.validate<{ name: string, email: string }>({ name: { type: "number", required }, email: { type: "string", required } })
						}

						it("throws an error", () => {
							assert.throws(doValidate, ParameterValidationError)
						})
					})
				})

				context("when object is nested", () => {
					before(() => {
						clientParams = {
							user: {
								name: "Mathias",
								email: "mathias@aerojs.io",
							},
						}
					})

					context("when using a correctly matching schema", () => {
						const doValidate = () => {
							serverParams.validate<{ user: { name: string, email: string } }>({
								user: {
									type: "object",
									required,
									properties: {
										name: {
											type: "string",
											required,
										},
										email: {
											type: "string",
											required,
										},
									},
								},
							})
						}

						it("doesn't throw an error", () => {
							assert.doesNotThrow(doValidate, ParameterValidationError)
						})
					})

					context("when using an incorrectly matching schema", () => {
						const doValidate = () => {
							serverParams.validate<{ name: string, email: string }>({ name: { type: "number", required }, email: { type: "string", required } })
						}

						it("throws an error", () => {
							assert.throws(doValidate, ParameterValidationError)
						})
					})
				})
			})
		}

		testValidate(false)
		testValidate(true)

		describe("test case from BOOKTID.NET", () => {
			before(() => {
				clientParams = {
					user: {
						name: "Mathias",
						email: "mathias@aerojs.io",
						password: "password",
					},
				}
			})

			const doValidate = () => {
				serverParams.validate<{
					user: {
						email: string,
						name: string,
						password: string
					}
				}>({
					user: {
						type: "object",
						required: true,
						properties: {
							email: { type: "string" },
							name: { type: "string" },
							password: { type: "string" },
						},
					},
				})
			}

			it("doesn't throw an error", () => {
				assert.doesNotThrow(doValidate, ParameterValidationError)
			})
		})
	})
})
