import { HookType } from "./HookType"
import { HookAction } from "./HookAction"

export type HookState<Key> = {
  before: {
    [key in HookType]: Array<HookAction<Key>>
  }
  after: {
    [key in HookType]: Array<HookAction<Key>>
  }
}
