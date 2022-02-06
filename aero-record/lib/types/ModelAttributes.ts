import { UsableFunction, BaseInterface } from "."

export type ModelAttributes<TRecord extends BaseInterface> = {
  [Key in keyof TRecord]: TRecord[Key] extends UsableFunction ? never : Key extends keyof BaseInterface ? never : Key
}[keyof TRecord]
