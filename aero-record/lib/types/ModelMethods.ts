import {  UsableFunction } from "./UsableFunction"
import Base from "../Base"

/* eslint-disable @typescript-eslint/no-explicit-any */
export type ModelMethods<TRecord> = {
  [Key in keyof TRecord]: TRecord[Key] extends UsableFunction ? Key : Key extends keyof Base<any> ? never : Key
}[keyof TRecord]
