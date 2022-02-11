import Base from "../Base"

import { QueryParams } from "../Query"
import { RecordInvalid, RecordNotUnique } from "../Errors"
import { ConstructorArgs, ModelAttributes, ValidatorOptions } from "../types"

export default class Validator<TRecord extends Base<TRecord>> {
	Model!: typeof Base
	property: keyof TRecord
	options: ValidatorOptions

	constructor(property: string, options: ValidatorOptions) {
		this.property = property as keyof TRecord
		this.options = options
	}

	async validate(instance: TRecord, throwOnError: boolean) {
		this.Model = instance.class<typeof Base>()

		if (this.options.unique) {
			const error = await this.#validateUnique(instance)

			if (error) {
				if (throwOnError) throw error
				instance.errors.add(this.property, error)
			}
		}

		if (this.options.present) {
			const error = await this.#validatePresent(instance)

			if (error) {
				if (throwOnError) throw error
				instance.errors.add(this.property, error)
			}
		}
	}

	async #validateUnique(instance: TRecord) {
		const property = this.property as ModelAttributes<TRecord>

		if (!instance[property]) {
			return new RecordNotUnique(`Cannot validate uniqueness of ${this.Model.name}#${property} because it is undefined`)
		}

		const queryArgs = {
			[property]: instance[property],
		} as ConstructorArgs<TRecord>

		let conflictingRecord = this.Model.where<TRecord>(queryArgs)

		if (instance.isPersisted) {
			conflictingRecord = conflictingRecord.whereNot({
				[this.Model.primaryIdentifier]: instance[this.Model.primaryIdentifier as keyof TRecord],
			} as QueryParams<TRecord>)
		}

		if (await conflictingRecord.first()) {
			return new RecordNotUnique(`${this.Model.name} with ${property} ${instance[property]} already exists`)
		}

		return undefined
	}

	#validatePresent(instance: TRecord) {
		if (!instance[this.property]) {
			return new RecordInvalid(`Missing required property ${this.property}`)
		} else {
			return undefined
		}
	}
}
