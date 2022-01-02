import { ModelAttributes } from "./ModelAttributes"

export type ConstructorArgs<TRecord> = Pick<
  TRecord,
  ModelAttributes<TRecord>
> | Record<string, never> | undefined
