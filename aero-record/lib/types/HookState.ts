import { HookType } from "./HookType"
import { HookAction } from "./HookAction"

export type HookState<TRecord> = {
  before: {
    [key in HookType]: Array<HookAction<TRecord>>
  }
  after: {
    [key in HookType]: Array<HookAction<TRecord>>
  }
}
