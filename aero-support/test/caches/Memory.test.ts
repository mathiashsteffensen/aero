import { expect } from "chai"

import AeroSupport from "../../lib/AeroSupport"

import { Cache, SetCacheOptions } from "../../lib/interfaces"

describe("AeroSupport.Caches.Memory", () => {
	let cache: Cache

	beforeEach(() => cache = new AeroSupport.Caches.Memory())

	describe("#get", () => {
		const key = "hello"

		const doGet = () => cache.get<string>(key)

		context("when no value has previously been set", () => {
			it("returns undefined", async () => {
				expect(await doGet()).to.be.undefined
			})
		})

		context("when a value has previously been set", () => {
			beforeEach(async () => {
				await cache.set(key, "world")
			})

			it("returns the set value", async () => {
				expect(await doGet()).to.eq("world")
			})
		})
	})

	describe("#set", () => {
		const key = "hello"
		let value: string
		let options: SetCacheOptions = {}

		const doSet = () => cache.set(key, value, options)

		context("with no options", () => {
			beforeEach(() => {
				value = "world"
			})

			it("sets the value", async () => {
				await doSet()
				expect(await cache.get(key)).to.eq("world")
			})
		})

		context("with options", () => {
			beforeEach(() => {
				value = "world"
				options = { ttl: 5 }
			})

			it("sets the value and expires it after the specified amount of time", async () => {
				await doSet()
				expect(await cache.get(key)).to.eq("world")
				await new Promise((resolve) => {
					setTimeout(resolve, 5)
				})
				expect(await cache.get(key)).to.eq(undefined)
			})
		})
	})

	describe("#delete", () => {
		beforeEach(async () => {
			await cache.set("hello", "world")
			await cache.delete("hello")
		})

		it("deletes the key", async () => {
			expect(await cache.get("hello")).to.be.undefined
		})
	})
})
