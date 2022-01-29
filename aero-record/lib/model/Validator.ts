import Base from "../Base"

import { RecordInvalid, RecordNotUnique } from "../Errors"
import { ConstructorArgs, ModelAttributes, ValidatorOptions } from "../types"

export default class Validator<TRecord extends Base<TRecord>> {
	Model!: typeof Base
	property: string
	options: ValidatorOptions

	constructor(property: string, options: ValidatorOptions) {
		this.property = property
		this.options = options
	}

	async validate(instance: TRecord, throwOnError: boolean) {
		this.Model = instance.class<typeof Base>()

		const errors: Array<Error> = []

		if (this.options.unique) {
			const error = await this.#validateUnique(instance)

			if (error) {
				if (throwOnError) throw error

				errors.push(error)
			}
		}

		if (this.options.present) {
			const error = await this.#validatePresent(instance)

			if (error) {
				if (throwOnError) throw error

				errors.push(error)
			}
		}

		instance.errors.set(this.property as keyof TRecord, errors)
	}

	async #validateUnique(instance: TRecord) {
		const property = this.property as ModelAttributes<TRecord>

		if (!instance[property]) {
			return new RecordNotUnique(`Cannot validate uniqueness of ${this.Model.name}#${property} because it is undefined`)
		}

		const queryArgs = {
			[property]: instance[property],
		} as ConstructorArgs<TRecord>

		const conflictingRecord = await this.Model.findBy<TRecord>(queryArgs)

		if (conflictingRecord) {
			return new RecordNotUnique(`${this.Model.name} with ${property} ${instance[property]} already exists`)
		}

		return undefined
	}

	#validatePresent(instance: TRecord) {
		if (!instance[this.property as keyof TRecord]) {
			return new RecordInvalid(`Missing required property ${this.property}`)
		} else {
			return undefined
		}
	}
}
