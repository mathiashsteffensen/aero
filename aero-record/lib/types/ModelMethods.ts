/* eslint-disable @typescript-eslint/ban-types */
export type ModelMethods<TRecord> = {
  [Key in keyof TRecord]: TRecord[Key] extends Function ? Key : never
}[keyof TRecord]
