import { HookOptions } from "./HookOptions"
import { ModelMethods } from "./ModelMethods"

export type HookAction<TRecord> = {
  action: ModelMethods<TRecord> | ((record: TRecord) => void) | ((record: TRecord) => Promise<void>)
  options: HookOptions<TRecord>
}
