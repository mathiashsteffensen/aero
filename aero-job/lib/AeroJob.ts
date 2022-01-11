import pino, { BaseLogger } from "pino"

import Worker from "./Worker"
import FileLoader from "./FileLoader"
import Runner from "./Runner"

export default abstract class AeroJob {
	static logger: BaseLogger = pino({
		transport: {
			target: "pino-pretty",
		},
	})
	static Worker = Worker

	private static fileLoader: FileLoader

	static initialize(workerDir: string) {
		this.fileLoader = new FileLoader(workerDir)
		this.fileLoader.load()

		return this
	}

	static async start() {
		const runner = new Runner(
			await Promise.all(
				this.fileLoader
					.files
					.map(async (file) => (await import(file)).default as typeof Worker),
			),
		)

		this.logger.info("AeroJob starting processing...")

		await runner.run()
	}
}
