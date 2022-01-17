import Controller from "./Controller"
import Controllers from "./Controllers"
import * as ViewEngines from "./view-engines"
import Routes from "./Routes"
import RouteHelpers from "./RouteHelpers"
import Server from "./Server"

export {
	Controller,
	Controllers,
	ViewEngines,
	Routes,
	RouteHelpers,
	Server,
}

export default class AeroWeb {
	static Controller = Controller
	static Controllers = Controllers
	static ViewEngines = ViewEngines
	static Routes = Routes
	static RouteHelpers = RouteHelpers
	static Server = Server
}
