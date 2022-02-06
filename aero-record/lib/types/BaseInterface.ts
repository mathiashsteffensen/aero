import { Knex } from "knex"

import { ConstructorArgs, Public, SaveOptions } from "."
import { Changes, ValidationErrors } from "../model"
import BasicObject from "../BasicObject"

export interface BaseInterface extends BasicObject {
  /* BasicObject types */
  clone(): any

  /* Query methods */
  save: (options: SaveOptions) => Promise<boolean>
  insert: (options: SaveOptions) => Promise<boolean>
  update: (options: SaveOptions) => Promise<boolean>
  reload: () => Promise<this>
  destroy: () => Promise<void>

  /* Modifying the object */
  fromRow: (row: Awaited<Knex.ResolveTableType<any>>) => void
  toRow: () => Record<string, unknown>
  fromObject: (obj: Record<string, unknown>) => void
  toObject: () => Record<string, unknown>
  updateAttributes: (attributes: ConstructorArgs<any>) => void

  /* State */
  validate: (throwOnError: boolean) => Promise<void>
  changes: Public<Changes<any>>
  errors: ValidationErrors<any>
  isPersisted: boolean
  isNewRecord: boolean
}
