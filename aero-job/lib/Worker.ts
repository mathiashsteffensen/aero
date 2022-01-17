import AeroJob from "./AeroJob"

export interface WorkerOptions {
  queue?: string
}

export const DEFAULT_WORKER_OPTIONS = {
	queue: "default",
}

export default class Worker {
	static get queue() {
		return this.options.queue || DEFAULT_WORKER_OPTIONS.queue
	}

	static options: WorkerOptions = {}

	static async performAsync<TWorkerArgs>(args: TWorkerArgs) {
		await this.enqueueJob(args)
	}

	static async performIn<TWorkerArgs>(ms: number, args: TWorkerArgs) {
		await this.enqueueJob(args, ms)
	}

	private static async enqueueJob<TWorkerArgs>(args: TWorkerArgs, ms = 0) {
		if (ms === 0) {
			await AeroJob.config.driver.enqueue(
				this.queue,
				this.name,
				args,
			)
		} else {
			await AeroJob.config.driver.schedule(
				this.queue,
				this.name,
				args,
				ms,
			)
		}
	}

	async perform(_args: unknown) {
		throw new Error(`${this.constructor.name}#perform called without implementing the method`)
	}
}
