import { pino }  from "pino"

const NODE_ENV = (process.env.NODE_ENV || "development")

const parent = pino(NODE_ENV === "development" ? {
	transport: {
		target: "pino-pretty",
		options: {
			colorize: true,
		},
	},
	level: "trace",
} : {
	level: "trace",
})

const defaultLogLevel = NODE_ENV === "test"
	? "warn"
	: NODE_ENV === "development"
		? "debug"
		: "info"

/* eslint-disable @typescript-eslint/no-explicit-any */
export default class Logger implements pino.BaseLogger {
	level: pino.Level | "silent" = defaultLogLevel

	silent: pino.LogFn
	trace: pino.LogFn
	debug: pino.LogFn
	info: pino.LogFn
	warn: pino.LogFn
	error: pino.LogFn

	constructor(private instance = parent) {
		this.silent = this.pinoDup("silent")
		this.trace = this.pinoDup("trace")
		this.debug = this.pinoDup("debug")
		this.info = this.pinoDup("info")
		this.warn = this.pinoDup("warn")
		this.error = this.pinoDup("error")
	}

	fatal(obj: unknown, msg?: string, ...args: any[]) {
		this.instance.fatal(obj, msg, args)
		process.exit()
	}

	bind(obj: Record<string, unknown>){
		return new Logger(this.instance.child(obj))
	}

	child = this.bind.bind(this)

	private shouldLog(level: pino.Level | "silent") {
		return (pino.levels.values[level] || 0) >= (pino.levels.values[this.level] || 0)
	}

	private pinoDup(level: pino.Level | "silent") {
		return (obj?: unknown, msg?: string, ...args: any[]) => {
			if (!obj) {
				this.level = level
				return
			}

			if (this.shouldLog(level)) {
				this.instance[level](obj, msg, args)
			}
		}
	}
}
