import Server from "./Server"
import Controller from "./Controller"
import Controllers from "./Controllers"
import Routes from "./Routes"
import RouteHelpers from "./RouteHelpers"

export {
	Server,
	Controller,
	Controllers,
	Routes,
	RouteHelpers,
}

export default class AeroWeb {
	static Server = Server
	static Controller = Controller
	static Controllers = Controllers
	static Routes = Routes
	static RouteHelpers = RouteHelpers
}
