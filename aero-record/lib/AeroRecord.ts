import AeroSupport from "@aero/aero-support"

import Base from "./Base"
import Connection from "./Connection"
import * as Decorators from "./decorators"
import * as Errors from "./Errors"
import * as Model from "./model"
import Query from "./Query"

export * from "./decorators"
export * from "./Errors"

export default abstract class AeroRecord {
	static Base = Base
	static Decorators = Decorators
	static Errors = Errors
	static Model = Model
	static Query = Query

	static connection: Connection
	static logger = new AeroSupport.Logger()

	static establishConnection(connectionName: string, configFile = "config/database.yml") {
		if (!this.connection) {
			this.connection = new Connection(configFile, connectionName)
		} else {
			this.connection.establishConnection(connectionName)
		}
	}
}
