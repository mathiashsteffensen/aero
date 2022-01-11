import Controller from "./Controller"
import Controllers from "./Controllers"
import EJSViewEngine from "./EJSViewEngine"
import Routes from "./Routes"
import RouteHelpers from "./RouteHelpers"
import Server from "./Server"

export {
	Controller,
	Controllers,
	EJSViewEngine,
	Routes,
	RouteHelpers,
	Server,
}

export default class AeroWeb {
	static Controller = Controller
	static Controllers = Controllers
	static EJSViewEngine = EJSViewEngine
	static Routes = Routes
	static RouteHelpers = RouteHelpers
	static Server = Server
}
