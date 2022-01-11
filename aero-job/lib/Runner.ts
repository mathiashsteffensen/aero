import Worker from "./Worker"

export default class Runner {
	#running = false
	WorkerClasses: Array<typeof Worker>

	constructor(WorkerClasses: Array<typeof Worker>) {
		this.WorkerClasses = WorkerClasses
	}

	async run() {
		if (!this.#running) {
			this.#running = true
			await Promise.all(
				this.WorkerClasses.map(async (WorkerClass) => {
					await WorkerClass.queue.process(WorkerClass.name, async ({ data }) => {
						const worker = new WorkerClass()

						await worker.perform(data)
					})
				}),
			)
		}
	}
}
