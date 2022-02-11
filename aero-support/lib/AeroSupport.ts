import BasicObject from "./BasicObject"
import * as Caches from "./caches"
import FileLoader from "./FileLoader"
import * as Helpers from "./Helpers"
import Hooks from "./Hooks"
import Logger from "./Logger"

export default abstract class AeroSupport {
	static BasicObject = BasicObject
	static Caches = Caches
	static FileLoader = FileLoader
	static Helpers = Helpers
	static Hooks = Hooks
	static Logger = Logger
}
