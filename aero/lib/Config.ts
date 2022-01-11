import pino from "pino"

export default class Config {
	/// Core config
	logLevel: pino.Level = "info"
	routesFile = "config/routes"
	databaseFile = "config/database.yml"
	viewDir = "app/views"
	controllerDir = "app/controllers"
	staticDir = "public"
}
