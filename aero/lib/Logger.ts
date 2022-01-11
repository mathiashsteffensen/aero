import {
	BaseLogger,
	Level,
	pino,
} from "pino"

const instance = pino({
	transport: {
		target: "pino-pretty",
		options: {
			colorize: true,
		},
	},
})

/* eslint-disable @typescript-eslint/no-explicit-any */
export default class Logger implements BaseLogger {
	silent: pino.LogFn
	trace: pino.LogFn
	debug: pino.LogFn
	info: pino.LogFn
	warn: pino.LogFn
	error: pino.LogFn

	constructor() {
		this.silent = instance.silent.bind(instance)
		this.trace = instance.trace.bind(instance)
		this.debug = instance.debug.bind(instance)
		this.info = instance.info.bind(instance)
		this.warn = instance.warn.bind(instance)
		this.error = instance.error.bind(instance)
	}

	set level(newLevel: Level | string) {
		instance.level = newLevel
	}

	get level(): Level | string {
		return instance.level
	}

	fatal(obj: unknown, msg?: string, ...args: any[]) {
		instance.fatal(obj, msg, args)
		process.exit()
	}
}
