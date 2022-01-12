import { UsableFunction } from "./UsableFunction"
import Base from "../Base"

export type ModelAttributes<TRecord extends Base<TRecord>> = {
  [Key in keyof TRecord]: TRecord[Key] extends UsableFunction ? never : Key extends keyof Base<TRecord> ? never : Key
}[keyof TRecord]
