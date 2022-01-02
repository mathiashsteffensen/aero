import pino from "pino"

import * as Errors from "./Errors"
import Base from "./Base"
import Query from "./query"
import Connection from "./Connection"

export default abstract class AeroRecord {
	static Errors = Errors
	static Base = Base
	static Query = Query

	static connection: Connection
	static logger = pino({
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
