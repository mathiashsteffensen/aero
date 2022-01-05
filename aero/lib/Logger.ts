import {
	BaseLogger,
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
	level = instance.level

	silent = instance.silent
	trace = instance.trace
	debug = instance.debug
	info = instance.info
	warn = instance.warn
	error = instance.error
	fatal(obj: unknown, msg?: string, ...args: any[]) {
		instance.fatal(obj, msg, args)
		process.exit()
	}
}
