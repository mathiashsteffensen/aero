import pino, { BaseLogger } from "pino"

import Base from "./Base"
import Connection from "./Connection"
import * as Decorators from "./decorators"
import * as Errors from "./Errors"
import Query from "./Query"

export default abstract class AeroRecord {
	static Base = Base
	static Decorators = Decorators
	static Errors = Errors
	static Query = Query

	static connection: Connection
	static logger: BaseLogger = pino({
		transport: {
			target: "pino-pretty",
			options: {
				colorize: true,
			},
		},
	})

	static establishConnection(connectionName: string, configFile = "config/database.yml") {
		if (!this.connection) {
			this.connection = new Connection(configFile, connectionName)
		} else {
			this.connection.establishConnection(connectionName)
		}
	}
}
