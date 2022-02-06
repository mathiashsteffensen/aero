import AeroRecord from "./AeroRecord"
import Base from "./Base"
import BelongsTo from "./BelongsTo"
import { BaseInterface, ConstructorArgs, DEFAULT_SAVE_OPTIONS, ModelAttributes, SaveOptions } from "./types"
import { QueryParams } from "./Query"
import AeroSupport from "@aero/aero-support"
import BasicObject from "./BasicObject"

export type KeyType = "foreignKey" | "key"

export type BaseFind<
  Key extends KeyType,
  TRecord extends BaseInterface,
> = (keyType: Key) => (
  key: string | number,
  foreignKey?: Key extends "foreignKey" ? (string | number) : never,
) => Promise<TRecord>

export type BaseCreate<
	Key extends KeyType,
	TRecord extends BaseInterface,
	> = (keyType: Key) => (
	key: Key extends "foreignKey" ? (string | number) : (string | number | undefined),
	params: ConstructorArgs<TRecord>,
	options: SaveOptions
) => Promise<TRecord>

export interface Options<
  TForeignRecord extends BaseInterface,
  TRelation extends Relation<TForeignRecord, TRelation>
> {
  foreignKey?: TRelation extends BelongsTo<TForeignRecord> ? never : string
  key?: TRelation extends BelongsTo<TForeignRecord> ? string : never
  optional?: TRelation extends BelongsTo<TForeignRecord> ? boolean : never
}

export default class Relation<
  TForeignRecord extends BaseInterface,
  TRelation extends Relation<TForeignRecord, TRelation>
> {
	constructor(
    protected target: BasicObject,
    protected Class: typeof Base,
    protected options: Options<TForeignRecord, TRelation>,
	) {}

	protected _keyAttribute?: string
	protected get keyAttribute() {
		return this._keyAttribute ||= AeroSupport.Helpers.toCamelCase(this.options.key as string)
	}

	protected get key() {
		return this.target.__send__(this.keyAttribute) as string | number
	}

	protected baseFind: BaseFind<KeyType, TForeignRecord> = (keyType) => {
		if (keyType === "foreignKey") {
			return async (key, foreignKey) => {
				const record = await this.Class.where<TForeignRecord>({
					[this.options.foreignKey as string]: foreignKey,
				} as ConstructorArgs<TForeignRecord>).where({
					[this.Class.primaryIdentifier]: key,
				} as unknown as QueryParams<TForeignRecord>).first()

				if (!record) {
					throw new AeroRecord.Errors.RecordNotFound(
						`${this.Class.name} with ${this.options.foreignKey} = '${foreignKey}' & ${this.Class.primaryIdentifier} = '${key}'`,
					)
				}

				return record
			}
		} else {
			return async (key) => {
				if (!key) return

				let record: TForeignRecord | undefined

				try {
					record = await this.Class.find<TForeignRecord>(key)
				} catch (e) {
					if (!(e instanceof AeroRecord.Errors.RecordNotFound)) {
						throw(e)
					}

					if (!this.options.optional) {
						throw(e)
					}
				}

				return record
			}
		}
	}

	protected baseCreate: BaseCreate<KeyType, TForeignRecord> = (keyType) => {
		if (keyType === "foreignKey") {
			return async (key, params, options) => {
				const record = this.Class.new<TForeignRecord>(params)

				record.__set__(this.options.foreignKey!, key)

				await record.save(options)

				return record
			}
		} else return async (key, params, options = DEFAULT_SAVE_OPTIONS) => {
			const record = this.Class.new<TForeignRecord>(params)

			if (key) {
				record.__set__(this.Class.primaryIdentifier, key)
			}

			await record.save(options);

			// Not sure why it is necessary to manually record changes here, some weird proxy stuff probably
			// TODO: Investigate
			(this.target as Base<any>).changes.recordChanges(
				this.keyAttribute as ModelAttributes<Base<any>>,
				this.target.__send__(this.keyAttribute) as Base<any>[ModelAttributes<Base<any>>],
				record.__send__(this.Class.primaryIdentifier) as Base<any>[ModelAttributes<Base<any>>],
			)

			this.target.__set__(
				this.keyAttribute,
				record.__send__(this.Class.primaryIdentifier),
			)

			await (this.target as Base<any>).save()

			return record
		}
	}
}
