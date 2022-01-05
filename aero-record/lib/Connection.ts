import * as fs from "fs"
import YAML from "yaml"
import knex, { Knex } from "knex"

import * as Errors from "./Errors"
import AeroRecord from "./AeroRecord"

/**
 * @internal
 */
export default class Connection {
	knex!: Knex
	config!: {
		[property: "production" | "staging" | "development" | "test" | string]: Knex.Config
	}

	constructor(configFile = "config/database.yml", connectionToEstablish = process.env.NODE_ENV || "development") {
		this.readConfig(configFile)
		this.establishConnection(connectionToEstablish)
	}

	/**
	 * Establish a new connection by a connection name defined in your config file
	 *
	 * @param connectionName - name of the connection to establish
	 */
	establishConnection(connectionName: string) {

		if (this.config[connectionName] == undefined) {
			throw new Errors.ConnectionError(`No configuration found for connection named ${connectionName}`)
		}

		try {
			this.knex = knex(this.config[connectionName] as Knex.Config)

			this.knex.on("query", AeroRecord.logger.debug)
			this.knex.on("query-error", (data) => AeroRecord.logger.warn(data))
		} catch (e) {
			if (e instanceof Error) {
				const wrappedErr = new Errors.ConnectionError(e.message)
				wrappedErr.stack = e.stack

				throw wrappedErr
			}

			throw e
		}
	}

	/**
	 * Close the database connection
	 */
	close() {
		this.knex.destroy().then(() => AeroRecord.logger.info("Database connection closed"))
	}

	readConfig(configFile: string) {
		this.config = YAML.parse(fs.readFileSync(configFile).toString())
	}
}
