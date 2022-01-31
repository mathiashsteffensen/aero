import * as Caches from "./caches"
import FileLoader from "./FileLoader"
import * as Helpers from "./Helpers"
import Logger from "./Logger"

export default abstract class AeroSupport {
	static Caches = Caches
	static FileLoader = FileLoader
	static Helpers = Helpers
	static Logger = Logger
}
