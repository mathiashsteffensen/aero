import { pino }  from "pino"

const NODE_ENV = (process.env.NODE_ENV || "development")

const instance = pino(NODE_ENV === "development" ? {
	transport: {
		target: "pino-pretty",
		options: {
			colorize: true,
		},
	},
	level: "trace",
} : {})

/* eslint-disable @typescript-eslint/no-explicit-any */
export default class Logger implements pino.BaseLogger {
	level: pino.Level | "silent" = NODE_ENV === "test" ? "warn" : "info"

	silent: pino.LogFn
	trace: pino.LogFn
	debug: pino.LogFn
	info: pino.LogFn
	warn: pino.LogFn
	error: pino.LogFn

	constructor() {
		this.silent = this.pinoDup("silent")
		this.trace = this.pinoDup("trace")
		this.debug = this.pinoDup("debug")
		this.info = this.pinoDup("info")
		this.warn = this.pinoDup("warn")
		this.error = this.pinoDup("error")
	}

	fatal(obj: unknown, msg?: string, ...args: any[]) {
		instance.fatal(obj, msg, args)
		process.exit()
	}

	private shouldLog(level: pino.Level | "silent") {
		return (pino.levels.values[level] || 0) >= (pino.levels.values[this.level] || 0)
	}

	private pinoDup(level: pino.Level | "silent") {
		return (obj: unknown, msg?: string, ...args: any[]) => {
			if (this.shouldLog(level)) {
				instance[level](obj, msg, args)
			}
		}
	}
}
