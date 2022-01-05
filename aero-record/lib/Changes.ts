import Base from "./Base"
import { ModelAttributes } from "./types"

export default class Changes<TRecord extends Base<TRecord>> {
	/**
	 * @internal
	 */
	static proxifyModel<TRecord extends Base<TRecord>>(model: TRecord) {
		return new Proxy(model, {
			set(target: Base<TRecord>, property: string | symbol, value: unknown) {
				target
					.changes
					.recordChanges(
						<ModelAttributes<TRecord>>property,
						target.__send__(property) as TRecord[ModelAttributes<TRecord>],
						value as TRecord[ModelAttributes<TRecord>],
					)

				return Reflect.set(target, property, value)
			},
		}) as TRecord
	}

	/**
	 * @internal
	 */
	readonly #originalValues: TRecord

	/**
	 * @internal
	 */
	#state: {
    [Key in ModelAttributes<TRecord>]?: [TRecord[Key], TRecord[Key]]
  }  = {}

	constructor(model: TRecord) {
		this.#originalValues = model.clone()
	}

	recordChanges(
		attribute: ModelAttributes<TRecord>,
		oldValue: TRecord[ModelAttributes<TRecord>],
		newValue: TRecord[ModelAttributes<TRecord>],
	) {
		if (newValue === oldValue) {
			return
		}

		if (!this.#state[attribute]) {
			this.#state[attribute] = [oldValue, newValue]
			return
		}

		if (this.#originalValues[attribute] !== newValue) {
			this.#state[attribute] = [oldValue, newValue]
			return
		}

		this.#state[attribute] = undefined
	}

	includes(attribute: ModelAttributes<TRecord>) {
		return Boolean(this.get(attribute))
	}

	get(attribute: ModelAttributes<TRecord>) {
		return this.#state[attribute]
	}
}
