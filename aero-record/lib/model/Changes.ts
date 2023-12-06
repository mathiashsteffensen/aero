import { BaseInterface, ModelAttributes } from "../types"
import { BaseRelation } from "../Relations"
import Base from "../Base"

export default class Changes<TRecord extends BaseInterface> {
	/**
	 * @internal
	 */
	static proxifyModel<TRecord extends BaseInterface>(model: TRecord) {
		return new Proxy(model, {
			set(target, property, value: unknown) {
				/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
				(target as unknown as Base<any>)
					.changes
					.recordChanges(
						property as string,
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
	#state = new Map<ModelAttributes<TRecord>, [TRecord[ModelAttributes<TRecord>], TRecord[ModelAttributes<TRecord>]]>()

	/**
	 * @internal
	 */
	constructor(model: TRecord) {
		this.#originalValues = model.clone()
	}

	/**
	 * @internal
	 */
	recordChanges(
		attribute: ModelAttributes<TRecord>,
		oldValue: TRecord[ModelAttributes<TRecord>],
		newValue: TRecord[ModelAttributes<TRecord>],
	) {
		if (newValue instanceof BaseRelation) return

		if (newValue === oldValue) {
			return
		}

		const currentChanges = this.#state.get(attribute)

		if (!currentChanges) {
			this.#state.set(attribute, [oldValue, newValue])
			return
		}

		if (this.#originalValues[attribute] === newValue) {
			this.#state.delete(attribute)
			return
		}

		this.#state.set(attribute, [oldValue, newValue])
	}

	includes(attribute: ModelAttributes<TRecord>) {
		return this.#state.has(attribute)
	}

	get(attribute: ModelAttributes<TRecord>) {
		return this.#state.get(attribute)
	}

	all() {
		return Object.fromEntries(this.#state)
	}
}
