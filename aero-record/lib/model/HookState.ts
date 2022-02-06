import { HookType, HookAction } from "../types"

export class HookState<TRecord> extends Map<
  string,
  {
    before: {
      [key in HookType]: Set<HookAction<TRecord>>
    }
    after: {
      [key in HookType]: Set<HookAction<TRecord>>
    }
  }
> {}
