import IORedis, { Redis as RedisClient } from "ioredis"

import { Cache, SetCacheOptions } from "../interfaces"

/**
 * Redis cache implementation
 */
export class Redis implements Cache {
	#client: RedisClient

	constructor(url = "redis://localhost:6379/0") {
		this.#client = new IORedis(url)
	}

	async get<TReturns>(key: string) {
		const value = await this.#client.get(key)

		if (!value) return undefined

		return JSON.parse(value).value as TReturns
	}

	async set<TValue>(key: string, value: TValue, options: SetCacheOptions = {}) {
		const stringifiedValue = JSON.stringify({ value })

		if (!options?.ttl) {
			await this.#client.set(key, stringifiedValue)
		} else {
			await this.#client.setex(key, options.ttl / 1000, stringifiedValue)
		}
	}

	async fetch<TReturns>(key: string, callback: () => Promise<TReturns>, options: SetCacheOptions = {}) {
		const cachedValue = await this.get<TReturns>(key)

		if (cachedValue) {
			return cachedValue
		}

		const newValue = await callback()

		await this.set(key, newValue, options)

		return newValue
	}

	async delete(key: string) {
		await this.#client.del(key)
	}

	async flush() {
		await this.#client.flushall()
	}
}
