import { Knex } from "knex"
import AeroRecord from "./AeroRecord"

interface QueryObject {
  sql: string
  bindings: Array<undefined>
}

interface QueryEventData extends QueryObject {
  __knexUid?: string
  __knexTxId?: string
}

export default class QueryLogger {
	/**
   *
   */
	#executingQueries = new Map<string, { start: number }>()

	constructor(knex: Knex) {
		// Right before a query is executed
		knex.on("query", (data: QueryEventData) => {
			this.#executingQueries.set(
				this.#extractId(data),
				{ start: Date.now() },
			)
		})

		// When an error occurs
		knex.on("query-error", (err: unknown, data: QueryEventData) => {
			AeroRecord.logger.warn(
				{
					err,
					sql: data.sql,
					bindings: data.bindings,
				},
				`AeroRecord query failed, processed for ${Date.now() - (this.#getQuery(data)?.start || 0)}ms`,
			)

			this.#executingQueries.delete(this.#extractId(data))
		})

		knex.on("query-response", (_response, data: QueryEventData) => {
			const start = this.#getQuery(data)?.start || 0
			const processingTime = Date.now() - start

			AeroRecord.logger.debug(
				{
					sql: data.sql,
					bindings: data.bindings,
					processingTime: processingTime,
				},
				`AeroRecord query executed in ${processingTime}ms`,
			)

			this.#executingQueries.delete(this.#extractId(data))
		})
	}

	#extractId(data: QueryEventData) {
		return <string>(data?.__knexUid || data?.__knexTxId)
	}

	#getQuery(data: QueryEventData) {
		return this.#executingQueries.get(this.#extractId(data)) as { start: number } | undefined
	}
}
