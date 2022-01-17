import Worker from "./Worker"
import AeroJob from "./AeroJob"

export default class Runner {
	#running = false
	WorkerClasses = new Map<string, Array<typeof Worker>>()

	constructor(WorkerClasses: Array<typeof Worker>) {
		for (const WorkerClass of WorkerClasses) {
			if (!this.WorkerClasses.has(WorkerClass.queue)) {
				this.WorkerClasses.set(WorkerClass.queue, [])
			}

			this.WorkerClasses.get(WorkerClass.queue)?.push(WorkerClass)
		}
	}

	run() {
		if (this.#running) return

		this.#running = true

		for (const [queue, WorkerClasses] of this.WorkerClasses) {
			Promise.all(
				WorkerClasses.map(
					async (WorkerClass) => {
						AeroJob.config.driver.process(queue, WorkerClass.name,async (args) => {
							const worker = new WorkerClass()

							await worker.perform(args)
						})
					},
				),
			).catch(AeroJob.logger.fatal)
		}
	}
}
