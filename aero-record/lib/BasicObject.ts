export default class BasicObject extends Object {
	__set__(attribute: string | symbol | number, value: unknown) {
		return Object.assign(this, {
			[attribute]: value,
		})
	}

	__send__(attribute: string | symbol | number) {
		return (this as Record<string | symbol | number, unknown>)[attribute] as unknown
	}

	async __send_func__(attribute: string | symbol | number) {
		return (this.__send__(attribute) as () => unknown | Promise<unknown>).call(this)
	}

	attributeIsMethod(attribute: string | symbol | number) {
		return typeof this.__send__(attribute) == "function"
	}

	clone<T extends this>() {
		return Object.assign({}, this) as T
	}

	class<T extends typeof BasicObject>() {
		return this.constructor as T
	}
}
