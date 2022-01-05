import { OptionalPick } from "./OptionalPick"
import { ModelAttributes } from "./ModelAttributes"
import Base from "../Base"

export type ConstructorArgs<TRecord extends Base<TRecord>> = OptionalPick<
  TRecord,
  ModelAttributes<TRecord>
>
