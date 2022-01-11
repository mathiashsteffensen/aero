import Bull from "bull"
import Queue from "./Queue"

export interface WorkerOptions {
  queue?: string
}

export const DEFAULT_WORKER_OPTIONS = {
	queue: "default",
}

export default class Worker {
	private static _queue: Bull.Queue
	static get queue() {
		return this._queue ||= Queue.get(this.options.queue || DEFAULT_WORKER_OPTIONS.queue)
	}

	static options: WorkerOptions = {}

	static async performAsync<TWorkerArgs>(args: TWorkerArgs) {
		await this.enqueueJob(args)
	}

	static async performIn<TWorkerArgs>(ms: number, args: TWorkerArgs) {
		await this.enqueueJob(args, ms)
	}

	static async performAt<TWorkerArgs>(ms: number, args: TWorkerArgs) {
		await this.enqueueJob(args, ms)
	}

	private static async enqueueJob<TWorkerArgs>(args: TWorkerArgs, ms = 0) {
		await this.queue.add(this.name, args, { delay: ms })
	}

	async perform(_args: unknown) {
		throw new Error(`${this.constructor.name}#perform called without implementing the method`)
	}
}
