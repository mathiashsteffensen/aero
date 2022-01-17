import { Cache, SetCacheOptions } from "../interfaces"

/**
 * In memory cache implementation
 */
export class Memory implements Cache {
	#cache = new Map<string, unknown>()

	async get<TReturns>(key: string) {
		return this.#cache.get(key) as TReturns | undefined
	}

	async set<TValue>(key: string, value: TValue, options: SetCacheOptions = {}) {
		this.#cache.set(key, value)

		if (options.ttl) {
			setTimeout(() => {
				this.#cache.delete(key)
			}, options.ttl)
		}
	}

	async fetch<TReturns>(key: string, callback: () => Promise<TReturns>, options: SetCacheOptions = {}) {
		if (this.#cache.has(key)) {
			return await this.get<TReturns>(key) as TReturns
		}

		const callbackResult = await callback()

		await this.set<TReturns>(key, callbackResult, options)

		return callbackResult
	}

	async delete(key: string) {
		this.#cache.delete(key)
	}

	async flush() {
		this.#cache = new Map<string, unknown>()
	}
}
