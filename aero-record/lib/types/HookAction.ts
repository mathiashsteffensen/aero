import { HookOptions } from "./HookOptions"

export type HookAction<Key> = {
  action: Key
  options: HookOptions<Key>
}
