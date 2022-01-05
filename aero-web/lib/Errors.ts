import { ErrorObject } from "ajv"

export class BadRequestError extends Error {
	status = 400
}

export class MissingParameterError extends BadRequestError {
	constructor(paramName: string) {
		super(`Missing required parameter ${paramName}`)
	}
}

export class ParameterValidationError extends BadRequestError {
	errors: Array<ErrorObject<string, Record<string, unknown>, unknown>>

	constructor(errors: Array<ErrorObject<string, Record<string, unknown>, unknown>>) {
		super()
		this.errors = errors
	}

	toJSON() {
		return {
			errors: this.errors,
		}
	}
}
