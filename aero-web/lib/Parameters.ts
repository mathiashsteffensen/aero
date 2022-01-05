import { FastifyRequest } from "fastify"
import { RouteGenericInterface } from "fastify/types/route"
import SchemaValidator from "ajv"

import * as Errors from "./Errors"
import { ParamType } from "./types"

export default class Parameters {
	readonly #params: RouteGenericInterface["Params"]

	validator = new SchemaValidator({ allErrors: true })

	constructor(request: FastifyRequest) {
		this.#params = {
			...request.params as object,
			...request.body as object,
		}
	}

	validate<T>(schema: {
		[Key in keyof T]: {
			type: ParamType
			required?: boolean
		}
	}) {
		this.validator.validate({
			type: "object",
			properties: schema,
			required: Object.keys(schema).filter((schemaKey) => schema[schemaKey as keyof T].required),
			additionalProperties: false,
		}, this.#params)
		if (this.validator.errors && this.validator.errors.length !== 0) {
			throw new Errors.ParameterValidationError(this.validator.errors)
		}

		return this.#params as T
	}
}
