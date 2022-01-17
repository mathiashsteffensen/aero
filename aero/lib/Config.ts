import pino from "pino"

import { Cache } from "@aero/aero-support/lib/interfaces"
import { ViewEngine } from "@aero/aero-web/dist/typings/types"

import Aero from "./Aero"

export default class Config {
	// Core config
	routesFile = "config/routes"
	databaseFile = "config/database.yml"
	controllerDir = "app/controllers"
	staticDir = "public"

	// View config
	viewDir = "app/views"
	set viewEngine(newValue: ViewEngine) {
		Aero.application.viewEngine = newValue
	}
	get viewEngine() { return Aero.application.viewEngine }

	// Log config
	get logLevel() { return Aero.logger.level }
	set logLevel(newValue: pino.Level | string) {
		Aero.logger.level = newValue
	}

	// Caching config
	set cache(newCache: Cache) {
		Aero.cache = newCache
	}
	get cache() { return Aero.cache }
}
