import { FunctionOrBaseAttribute } from "./FunctionOrBaseAttribute"

export type ModelAttributes<TRecord> = {
  [Key in keyof TRecord]: TRecord[Key] extends FunctionOrBaseAttribute<TRecord> ? never : Key
}[keyof TRecord]
