import AeroSupport from "@aero/aero-support"
import Base from "../Base"
import BasicObject from "@aero/aero-support/dist/typings/BasicObject"

export type HookType = "save" | "update" | "create" | "destroy" | "validation" | "initialization"

const Hooks = new AeroSupport.Hooks<
  Record<string, unknown> & BasicObject,
  typeof Base,
  HookType
>((Class) => Class.tableName)

export default Hooks
