import Base from "@aero/aero-record/dist/typings/Base"
import FormBuilder from "./FormBuilder"
import { FormBuilderOptions } from "./types"

export default class FormHelpers {
	formFor = <TRecord extends Base<TRecord>>(record: TRecord, callback: (f: FormBuilder<TRecord>) => void, options: FormBuilderOptions = {}) => {
		const form = new FormBuilder(record, options)

		callback(form)

		return form.render()
	}
}
