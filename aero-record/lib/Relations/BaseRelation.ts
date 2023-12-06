import { BaseInterface, ConstructorArgs, DEFAULT_SAVE_OPTIONS } from "../types"
import Base from "../Base"
import DependencyHandler from "./DependencyHandler"
import AeroSupport from "@aero/aero-support"
import AeroRecord from "../AeroRecord"
import { QueryParams } from "../Query"
import { DependenceType, Options, RelationType } from "./index"
import BasicObject from "@aero/aero-support/dist/typings/BasicObject"

export default class BaseRelation<
	TForeignRecord extends BaseInterface,
	TRelation extends BaseRelation<TForeignRecord, TRelation>
	> {
	constructor(
		protected relationType: RelationType,
		protected attribute: string,
		protected target: BasicObject,
		protected Class: typeof Base,
		protected options: Options<TForeignRecord, TRelation> = {},
	) {}

	static attachDependencyHandler(
		Class: typeof Base,
		dependencyType: DependenceType,
		attribute: string,
	) {
		Class.after("destroy", DependencyHandler(dependencyType, Class, this.name as RelationType, attribute))
	}

	protected _localKeyAttribute?: string
	protected get localKeyAttribute() {
		return this._localKeyAttribute ||= AeroSupport.Helpers.toCamelCase(this.options.localKey as string)
	}

	protected get localKey() {
		return this.target.__send__(this.localKeyAttribute) as string | number | undefined
	}

	protected _foreignKeyAttribute?: string
	protected get foreignKeyAttribute(): string {
		return this._foreignKeyAttribute ||= AeroSupport.Helpers.toCamelCase(this.options.foreignKey as string)
	}

	protected get foreignKey() {
		return this.target.__send__((this.target.class() as typeof Base).primaryIdentifier) as string | number
	}

	protected queryByForeignKey() {
		return this.Class.where<TForeignRecord>({
			[this.options.foreignKey as string]: this.foreignKey,
		} as unknown as ConstructorArgs<TForeignRecord>)
	}

	protected async findByLocalKey() {
		if (!this.localKey) return

		let record: TForeignRecord | undefined

		try {
			record = await this.Class.find<TForeignRecord>(this.localKey)
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

	protected async findByForeignKey(id?: string | number) {
		let query = this.queryByForeignKey()

		if (id) {
			query = query.where({
				[this.Class.primaryIdentifier]: id,
			} as unknown as QueryParams<TForeignRecord>)
		}

		const record = await query.first()

		if (!this.options.optional && !record) {
			throw new AeroRecord.Errors.RecordNotFound(
				`${this.Class.name} with ${this.options.foreignKey} = '${this.foreignKey}'${id ? ` & ${this.Class.primaryIdentifier} = '${id}' not found` : ""}`,
			)
		}

		return record
	}

	protected async allByForeignKey() {
		return this.Class.where<TForeignRecord>({
			[this.options.foreignKey as string]: this.foreignKey,
		} as unknown as ConstructorArgs<TForeignRecord>).all()
	}

	protected newByLocalKey(params: ConstructorArgs<TForeignRecord> = {}) {
		return this.Class.new<TForeignRecord>({
			[this.Class.primaryIdentifier]: this.localKey,
			...params,
		})
	}

	protected newByForeignKey(params: ConstructorArgs<TForeignRecord> = {}) {
		return this.Class.new<TForeignRecord>({
			[this.foreignKeyAttribute]: this.foreignKey,
			...params,
		})
	}

	protected async createByLocalKey(params: ConstructorArgs<TForeignRecord> = {}, options = DEFAULT_SAVE_OPTIONS) {
		const record = this.Class.new<TForeignRecord>(params)

		if (this.localKey) {
			record.__set__(this.Class.primaryIdentifier, this.localKey)
		}

		await record.save(options)

		this.target.__set__(
			this.localKeyAttribute,
			record.__send__(this.Class.primaryIdentifier),
		)

		await (this.target as BaseInterface).save(options)

		return record
	}

	protected async createByForeignKey(params: ConstructorArgs<TForeignRecord> = {}, options = DEFAULT_SAVE_OPTIONS) {
		const record = this.newByForeignKey(params)

		await record.save(options)

		return record
	}

	protected async updateByForeignKey(
		params: ConstructorArgs<TForeignRecord> = {},
		options = DEFAULT_SAVE_OPTIONS,
		id?: string | number,
	) {
		const record = await this.findByForeignKey(id)

		if (!record) throw new AeroRecord.Errors.RecordNotFound(
			`${this.Class.name} with ${this.options.foreignKey} = '${this.foreignKey}'${id ? ` & ${this.Class.primaryIdentifier} = '${id}' not found` : ""}`,
		)

		record.updateAttributes(params)

		return record.update(options)
	}
}
