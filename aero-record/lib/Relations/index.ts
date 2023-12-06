import BaseRelation from "./BaseRelation"
import BelongsTo from "./BelongsTo"
import HasOne from "./HasOne"
import HasMany from "./HasMany"

import { BaseInterface } from "../types"

export type KeyType = "foreignKey" | "key"

export type DependenceType = "destroy" | "restrictWithError"

export type RelationType = "HasOne" | "HasMany" | "BelongsTo"

export interface Options<
  TForeignRecord extends BaseInterface,
  TRelation extends BaseRelation<TForeignRecord, TRelation>
> {
  foreignKey?: TRelation extends HasOne<TForeignRecord> | HasMany<TForeignRecord> ? string : never
  localKey?: TRelation extends BelongsTo<TForeignRecord> ? string : never
  optional?: TRelation extends BelongsTo<TForeignRecord> | HasOne<TForeignRecord> | HasMany<TForeignRecord> ? boolean : never
	dependent?: DependenceType
}

export {
	BaseRelation,
	BelongsTo,
	HasMany,
	HasOne,
}
