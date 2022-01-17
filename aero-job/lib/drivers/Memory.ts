import cuid from "cuid"

import { Driver } from "./Driver"
import AeroJob from "../AeroJob"

interface Job {
  id: string
  name: string
  args: unknown
}

type Queue = Map<string, Job>

export class Memory implements Driver {
	private queues = new Map<string, Queue>()

	private getQueue(name: string): Queue {
		if(this.queues.has(name)) {
			return this.queues.get(name) as Queue
		}

		const queue = new Map<string, Job>()
		this.queues.set(name, queue)

		return queue
	}

	async enqueue(queueName: string, jobName: string, args: unknown, jobId = cuid()): Promise<string> {
		this.getQueue(queueName).set(jobId, {
			id: jobId,
			name: jobName,
			args: args,
		})

		return jobId
	}

	async schedule(queueName: string, jobName: string, args: unknown, delay: number): Promise<string> {
		const jobId = cuid()

		setTimeout(() => this.enqueue(queueName, jobName, args, jobId), delay)

		return jobId
	}

	process(queueName: string, jobName: string, processor: (args: unknown) => Promise<void>): void {
		const queue = this.getQueue(queueName)

		for (const [jobId, job] of queue) {
			if (job.name === jobName) {
				queue.delete(jobId)

				const start = Date.now()

				processor(job.args)
					.then(() => AeroJob.logger.info(`${jobName}:${jobId} processed in ${Date.now() - start}ms`))
					.catch(AeroJob.logger.warn)
			}
		}

		// No jobs to process, call ourselves again in 10ms
		setTimeout(() => this.process(queueName, jobName, processor), 10)
	}
}
