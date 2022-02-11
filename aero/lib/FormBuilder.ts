import pluralize from "pluralize"

import Base from "@aero/aero-record/dist/typings/Base"

import Aero from "./Aero"
import { FormBuilderOptions, FormConfig } from "./types"

export default class FormBuilder<TRecord extends Base<TRecord>> {
	inputs: Array<string> = []
	options: FormBuilderOptions

	constructor(
		private readonly record: TRecord,
		options: FormBuilderOptions,
	) {
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

	private get config() {
		if (!this.options.variant) return Aero.config.aeroForm

		return Aero.config.aeroForm.variants[this.options.variant]!
	}

	private getConfigValue(configKey: keyof Omit<FormConfig, "variants">) {
		if (!this.config[configKey]) return Aero.config.aeroForm[configKey]

		return this.config[configKey]
	}

	input(attribute: string, type: HTMLInputElement["type"] = "text") {
		const id = `${pluralize(this.recordTableName, 1)}[${attribute}]`
		const errors = this.record.errors.get(attribute as keyof TRecord) || []

		this.inputs.push(`
			<div class="${this.getConfigValue("inputWrapperClass")}">
				<label for="${id}">
					${attribute[0]?.toUpperCase()}${attribute.slice(1)}
				</label>
				<input
					class="${this.getConfigValue("inputClass")}"
					value="${this.record[attribute as keyof Base<TRecord>] || ""}"
					name="${id}"
					id="${id}"
					type="${type}"
				/>
				${errors.length !== 0 ? `<div class="${this.getConfigValue("errorFeedbackClass")}">
					${errors.map((err) => `<span>
						${err.message}
					</span>`)}
				</div>` : ""}
			</div>
		`)
	}

	button(text: string) {
		this.inputs.push(`<button class="${this.getConfigValue("buttonClass")}">${text}</button>`)
	}

	render() {
		return `
			<form class="${this.getConfigValue("formClass")}" action="${this.options.path}" method="${this.options.method}" >
				${this.inputs.join("\n")}
			</form>
		`
	}
}
