import { Knex } from "knex"

import BasicObject from "@aero/aero-support/lib/BasicObject"

import { ConstructorArgs, Public, SaveOptions } from "."
import { HookType } from "../model/Hooks"
import TransactionManager from "../model/TransactionManager"

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface BaseInterface extends BasicObject {
  /* BasicObject types */
  clone(): any

  /* Query methods */
  primaryIdentifier: string
  save: (options?: SaveOptions) => Promise<boolean>
  insert: (options?: SaveOptions) => Promise<boolean>
  update: (options?: SaveOptions) => Promise<boolean>
  reload: () => Promise<this>
  destroy: () => Promise<void>
  transaction: Public<TransactionManager>

  /* Modifying the object */
  fromRow: (row: Awaited<Knex.ResolveTableType<any>>) => void
  toRow: () => Record<string, unknown>
  fromObject: (obj: Record<string, unknown>) => void
  toObject: () => Record<string, unknown>
  updateAttributes: (attributes: ConstructorArgs<any>) => void

  /* State */
  validate: (throwOnError: boolean) => Promise<void>
  isPersisted: boolean
  isNewRecord: boolean
  callHooks: (timing: "before" | "after", type: HookType) => Promise<void>
}
