import pluralize from "pluralize"

import Aero from "./Aero"

import Base from "@aero/aero-record/dist/typings/Base"
import { FormBuilderOptions } from "./types"

export default class FormBuilder<TRecord extends Base<TRecord>> {
	inputs: Array<string> = []
	record: TRecord
	options: FormBuilderOptions

	constructor(record: TRecord, options: FormBuilderOptions) {
		this.record = record

		options.path = options.path || this.inferredPathFromRecord || "/"
		options.method = options.method || "POST"

		this.options = options
	}

	private get recordTableName() {
		return this.record.class<typeof Base>().tableName
	}

	private get inferredPathFromRecord() {
		if (this.record.isNewRecord) {
			return Aero.routes.make[`create_${this.recordTableName}`]?.()?.path
				|| Aero.routes.make[`create_${pluralize.singular(this.recordTableName)}`]?.()?.path
		} else {
			return Aero.routes.make[`update_${this.recordTableName}`]?.()?.path
				|| Aero.routes.make[`update_${pluralize.singular(this.recordTableName)}`]?.()?.path
		}
	}


	input(attribute: string, type: HTMLInputElement["type"] = "text") {
		const id = `${pluralize(this.recordTableName, 1)}[${attribute}]`
		const errors = this.record.errors.get(attribute as keyof TRecord) || []

		this.inputs.push(`
			<div class="${Aero.config.aeroForm.inputWrapperClass}">
				<label for="${id}">
					${attribute[0]?.toUpperCase()}${attribute.slice(1)}
				</label>
				<input
					class="${Aero.config.aeroForm.inputClass}"
					value="${this.record[attribute as keyof Base<TRecord>] || ""}"
					name="${id}"
					id="${id}"
					type="${type}"
				/>
				${errors.length !== 0 ? `<div class="${Aero.config.aeroForm.errorFeedbackClass}">
					${errors.map((err) => `<span>
						${err.message}
					</span>`)}
				</div>` : ""}
			</div>
		`)
	}

	button(text: string) {
		this.inputs.push(`<button class="${Aero.config.aeroForm.buttonClass}">${text}</button>`)
	}

	render() {
		return `
			<form action="${this.options.path}" method="${this.options.method}" >
				${this.inputs.join("\n")}
			</form>
		`
	}
}
