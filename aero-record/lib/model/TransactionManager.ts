import { Knex } from "knex"

import AeroRecord from "../AeroRecord"

/**
 * Manages Transactions for a model instance
 */
export default class TransactionManager {
	private current: Knex.Transaction | null = null

	async commit() {
		await this.current?.commit()
		this.current = null
	}

	async rollback() {
		await this.current?.rollback()
		this.current = null
	}

	async begin(config?: Knex.TransactionConfig) {
		this.current = await AeroRecord.connection.knex.transaction(config)
	}

	get isTransacting() {
		return !!this.current
	}

	get transactionOrConnection() {
		return this.current || AeroRecord.connection.knex
	}
}
