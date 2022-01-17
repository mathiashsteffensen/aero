export interface Driver {
  enqueue(queueName: string, jobName: string, args: unknown): Promise<string>
  schedule(queueName: string, jobName: string, args: unknown, delay: number): Promise<string>
  process(queueName: string, jobName: string, processor: (args: unknown) => Promise<void>): void
}
