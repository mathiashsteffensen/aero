export type HookOptions<TRecord> = {
  if?: keyof TRecord | ((record: TRecord) => boolean) | ((record: TRecord) => Promise<boolean>)
  unless?: keyof TRecord | ((record: TRecord) => boolean) | ((record: TRecord) => Promise<boolean>)
}
