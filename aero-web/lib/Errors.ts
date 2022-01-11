import { ErrorObject } from "ajv"
import { RouteState } from "./types"

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

export class RouteError extends Error {
	constructor(route: RouteState[0], originalErr: unknown) {
		super()

		if (originalErr instanceof Error) {
			this.setMessage(route.method, route.path, originalErr.message)
			this.stack = originalErr.stack
		} else {
			this.setMessage(route.method, route.path, String(originalErr))
		}
	}

	setMessage(method: string, path: string, message: string) {
		this.message = `Failed to add route ${method} ${path} with error: ${message}`
	}
}
