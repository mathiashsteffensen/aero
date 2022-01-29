import Base from "../Base"

export default class ValidationErrors<TRecord extends Base<TRecord>> extends Map<keyof TRecord, Array<Error>> {
	any() {
		for (const [_key, errors] of this) {
			if(errors.length !== 0) return true
		}

		return false
	}

	asJSON() {
		const prevObject = Object.fromEntries(this)
		const object: { [p: string]: Array<string> } = {}

		for (const key of Object.keys(prevObject)) {
			object[key] = prevObject[key]?.map(err => err.message) as Array<string>
		}

		return object
	}
}
