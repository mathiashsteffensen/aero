import Base from "@aero/aero-record/dist/typings/Base"

export default class FormBuilder<TRecord extends Base<TRecord>> {
	record: TRecord

	constructor(record: TRecord) {
		this.record = record
	}
}
