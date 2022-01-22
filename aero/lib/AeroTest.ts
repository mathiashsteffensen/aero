import { InjectOptions, LightMyRequestResponse } from "fastify"

import { UsableFunction } from "@aero/aero-record/dist/typings/types"
import Application from "./Application"

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

/**
 * Helpers for testing your Aero application
 */
export default class AeroTest {
	/**
   * Wraps a mocha describe block and provides functionality specific to testing your Aero application
   */
	static describe<T extends UsableFunction>(DescribedClass: T, application: Application, callback: DescribeCallback) {
		const test = new this(application)
		describe(DescribedClass.name, () => callback({
			post: test.post.bind(test),
			get: test.get.bind(test),
		}))
	}

	async post(path: string, data: InjectOptions["payload"], headers: Record<string, string>) {
		return await this.#application.server.fastify.inject({
			method: "POST",
			payload: data,
			path,
			headers,
		})
	}

	async get(path: string, headers: Record<string, string>) {
		return await this.#application.server.fastify.inject({
			method: "GET",
			path,
			headers,
		})
	}

	#application: Application
	constructor(application: Application) {
		this.#application = application

	}
}
