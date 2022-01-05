import Base from "@aero/aero-record/dist/typings/Base"
import FormBuilder from "./FormBuilder"

export default class FormHelpers {
	form_for<TRecord extends Base<TRecord>>(record: TRecord, callback: (f: FormBuilder<TRecord>) => string) {
		return callback(new FormBuilder(record))
	}
}
