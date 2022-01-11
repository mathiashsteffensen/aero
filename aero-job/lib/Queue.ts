import Bull from "bull"
import AeroJob from "./AeroJob"

// Reuse queue instances across workers by caching them in-memory here
const queues = new Map<string, Bull.Queue>()

export default class Queue {
	static get(name: string): Bull.Queue {
		if (queues.has(name)) {
			return queues.get(name) as Bull.Queue
		}

		return this.addQueue(name)
	}

	/**
   * @internal
   */
	private static addQueue(name: string) {
		const queue = Bull(name)

		queue.on("failed", (job, err) => {
			AeroJob.logger.warn({
				event: "job_failed",
				job,
				err,
			}, `${job.name} failed with error ${err}`)
		})

		queue.on("active", (job) => {
			AeroJob.logger.info(`${job.name}:${job.id} started processing`)
		})

		queue.on("completed", (job) => {
			AeroJob.logger.info(`${job.name}:${job.id} done ${job.processedOn ? `in ${Date.now() - job.processedOn} ms` : ""}`)
		})

		queues.set(name, queue)

		return queue
	}
}
