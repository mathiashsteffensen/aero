import { OptionalPick, ModelAttributes, BaseInterface } from "."

export type ConstructorArgs<TRecord extends BaseInterface> = OptionalPick<
  TRecord,
  ModelAttributes<TRecord>
>
