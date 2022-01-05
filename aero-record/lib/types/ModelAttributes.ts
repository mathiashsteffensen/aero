import { UsableFunction } from "./UsableFunction"
import Base from "../Base"

export type ModelAttributes<TRecord extends Base<TRecord>> = {
  [Key in keyof TRecord]: TRecord[Key] extends UsableFunction ? Key extends keyof Base<TRecord> ? never : Key : Key
}[keyof TRecord]
