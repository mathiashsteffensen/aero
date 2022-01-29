import { InjectOptions, LightMyRequestResponse } from "fastify"
import knexConstructor, { Knex } from "knex"
import mocha from "mocha"

import AeroRecord from "@aero/aero-record"
import { UsableFunction } from "@aero/aero-record/dist/typings/types"

import Aero from "./Aero"

export type TestResponse = LightMyRequestResponse

export interface DescribeOptions {
  controller?: boolean
  model?: boolean
  worker?: boolean
}

export type DescribeCallbackArguments = {
	post: AeroTest["post"]
	get: AeroTest["get"]
}

export type DescribeCallback = (args: DescribeCallbackArguments) => void | Promise<void>

let aero: Promise<typeof Aero | void>

/**
 * Helpers for testing your Aero application
 */
export default class AeroTest {
	static hooks(AeroClass: typeof Aero) {
		 aero = AeroClass
			.initialize("config/Application")
			.catch(Aero.logger.fatal)

		AeroRecord.establishConnection("test")

		const knex = knexConstructor(AeroRecord.connection.config["test"] as unknown as Knex.Config)
		knex.on("query-error", (data) => AeroRecord.logger.warn(data))

		return {
			async beforeEach() {
				(AeroRecord.connection.knex as unknown as Knex.Transaction) = await knex.transaction()
			},
			async afterEach() {
				await (AeroRecord.connection.knex as unknown as Knex.Transaction).rollback()
			},
			async beforeAll() {
				await aero
			},
			async afterAll() {
				await AeroRecord.connection.close()
				setTimeout(process.exit, 200)
			},
		}
	}

	/**
   * Wraps a mocha describe/context block and provides functionality specific to testing your Aero application
   */
	static wrap<T extends UsableFunction>(describe: typeof mocha.describe, DescribedClass: T, callback: DescribeCallback) {
		const test = new this()
		describe(DescribedClass.name, () => callback({
			post: test.post.bind(test),
			get: test.get.bind(test),
		}))
	}

	async post(path: string, data: InjectOptions["payload"], headers: Record<string, string>) {
		return (await aero)?.application.server.fastify.inject({
			method: "POST",
			payload: data,
			path,
			headers,
		});
	}

	async get(path: string, headers: Record<string, string>) {
		return (await aero)?.application.server.fastify.inject({
			method: "GET",
			path,
			headers,
		});
	}
}
