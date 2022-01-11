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

		options.path = options.path || Aero.routes.make[this.recordTableName]?.() || "/"
		options.method = options.method || "POST"

		this.options = options
	}

	get recordTableName() {
		return this.record.class<typeof Base>().tableName
	}

	input(attribute: string, type: HTMLInputElement["type"] = "text") {
		const id = `${pluralize(this.recordTableName, 1)}[${attribute}]`

		this.inputs.push(`
			<div>
				<label for="${id}">
					${attribute[0]?.toUpperCase()}${attribute.slice(1)}
				</label>
				<input name="${id}" id="${id}" type="${type}" />
			</div>
		`)
	}

	button(text: string) {
		this.inputs.push(`<button>${text}</button>`)
	}

	render() {
		return `
			<form action="${this.options.path}" method="${this.options.method}" >
				${this.inputs.join("\n")}
			</form>
		`
	}
}
