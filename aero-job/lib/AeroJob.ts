import pino, { BaseLogger } from "pino"

import AeroSupport from "@aero/aero-support"
import FileLoader from "@aero/aero-support/dist/typings/FileLoader"

import Worker from "./Worker"
import Runner from "./Runner"
import Config from "./Config"

export default abstract class AeroJob {
	static config = new Config()
	static logger: BaseLogger = pino({
		transport: {
			target: "pino-pretty",
		},
	})
	static Worker = Worker

	private static fileLoader: FileLoader

	static initialize(workerDir: string) {
		this.fileLoader = new AeroSupport.FileLoader(workerDir)
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
