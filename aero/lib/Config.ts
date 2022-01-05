import pino from "pino"

export default class Config {
	/// Core config
	logLevel: pino.Level = "info"
	routesFile = "config/routes"
	viewDir = "app/views"
	controllerDir = "app/controllers"
}
