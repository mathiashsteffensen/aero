import Base from "../Base"
import { ModelMethods } from "./ModelMethods"

export type MethodDecorator =
  <TRecord extends Base<TRecord>>(
    target: TRecord,
    key: ModelMethods<TRecord>,
    descriptor: TypedPropertyDescriptor<() => void | Promise<void>>
  ) => void
