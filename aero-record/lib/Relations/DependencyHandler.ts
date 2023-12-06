import AeroRecord from "../AeroRecord"
import Base from "../Base"
import { BaseInterface } from "../types"

import { DependenceType } from "./index"
import HasOne from "./HasOne"
import BelongsTo from "./BelongsTo"
import HasMany from "./HasMany"

const DependencyHandler = (
	dependencyType: DependenceType,
	ForeignClass: typeof Base,
	relationType: "HasOne" | "HasMany" | "BelongsTo",
	attribute: string,
): (instance: BaseInterface) => Promise<void> => {
	const throwRestrictWithError = (instance: BaseInterface) => {
		throw new Error(
			`Attempted to delete ${instance.class<typeof Base>().name} but failed due to restrictWithError relationship with ${ForeignClass.name}`,
		)
	}

	switch (relationType) {
	case "HasOne" || "BelongsTo":
		return async (instance) => {
			let record: BaseInterface | undefined

			try {
				record = await (instance.__send__(attribute) as HasOne<BaseInterface> | BelongsTo<BaseInterface>).find()
			} catch (e) {
				if (!(e instanceof AeroRecord.Errors.RecordNotFound)) {
					throw e
				}
			}

			if (record) {
				if (dependencyType === "restrictWithError") {
					throwRestrictWithError(instance)
				} else if (dependencyType === "destroy") {
					record.transaction = instance.transaction
					await record.destroy()
				}
			}
		}

	case "HasMany":
		return async (instance) => {
			console.log(`CALLING dependency handler HasMany for ${instance.class<typeof Base>().name}`)
			const records = await (instance.__send__(attribute) as HasMany<BaseInterface>).all()

			if (records.length !== 0) {
				if (dependencyType === "restrictWithError") {
					throwRestrictWithError(instance)
				} else if (dependencyType === "destroy") {
					await Promise.all(
						records.map(
							(record) => record.destroy(),
						),
					)
				}
			}
		}

	default:
		throw new Error("")
	}
}

export default DependencyHandler
