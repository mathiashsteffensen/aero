import Base from "../Base"

export type AttributeDecorator = <TRecord extends Base<TRecord>>(target: TRecord, key: keyof TRecord) => void
