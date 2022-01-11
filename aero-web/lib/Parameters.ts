import { FastifyRequest } from "fastify"
import { RouteGenericInterface } from "fastify/types/route"
import SchemaValidator from "ajv"

import * as Errors from "./Errors"
import { ParamType } from "./types"
import { ParameterSchema } from "./types/ParameterSchema"

export interface ParameterValidationOptions {
	additionalProperties?: boolean
}

export default class Parameters {
	readonly #params: RouteGenericInterface["Params"]

	validator = new SchemaValidator({ allErrors: true })

	constructor(request: FastifyRequest) {
		this.#params = {
			...request.params as object,
			...request.body as object,
		}
	}

	validate<T>(schema: ParameterSchema<T>, options: ParameterValidationOptions = {}) {
		const properties: Record<string, {
			type: ParamType
			properties?: Record<string, {
				type: ParamType
			}>,
			required?: Array<string>
		}> = {}
		const required: Array<string> = []

		for (const key of Object.keys(schema)) {
			const schemaValue = schema[key as keyof T]

			if (schemaValue.type === "object") {
				properties[key] = {
					type: schemaValue.type,
					properties: {},
					required: [],
				}

				for (const nestedKey of Object.keys(schemaValue.properties || {})) {
					const nestedSchemaValue = schemaValue.properties?.[nestedKey as keyof T[keyof T]]

					const type = nestedSchemaValue?.type

					if (!type) {
						continue
					}

					(properties[key] as { properties: Record<string, { type: ParamType }> }).properties[nestedKey] = {
						type,
					};

					(properties[key] as { required: Array<string> }).required.push(nestedKey)
				}
			} else {
				properties[key] = {
					type: schemaValue.type,
				}
			}

			if (schemaValue.required) {
				required.push(key)
			}
		}

		const ajvSchema = {
			type: "object",
			properties,
			required,
			additionalProperties: options.additionalProperties || false,
		}

		this.validator.validate(ajvSchema, this.#params)
		if (this.validator.errors && this.validator.errors.length !== 0) {
			throw new Errors.ParameterValidationError(this.validator.errors)
		}

		return this.#params as T
	}
}
