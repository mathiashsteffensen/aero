import { BaseInterface } from "../types"

export default class ValidationErrors<TRecord extends BaseInterface> extends Map<keyof TRecord, Array<Error>> {
	add(property: keyof TRecord, ...errors: Array<Error>) {
		const existingErrors = this.get(property) || []

		existingErrors.push(...errors)

		this.set(property, existingErrors)
	}

	any() {
		/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
		for (const [_key, errors] of this) {
			if (errors.length !== 0) return true
		}

		return false
	}

	asJSON() {
		const prevObject = Object.fromEntries(this)
		const object: { [p: string]: Array<string> } = {}

		for (const key of Object.keys(prevObject)) {
			object[key] = prevObject[key]?.map(err => err.message) as Array<string>
		}

		return object as unknown as {
			[p in keyof TRecord]: Array<string>
		}
	}
}
