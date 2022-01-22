import * as Caches from "./caches"
import Logger from "./Logger"
import FileLoader from "./FileLoader"

export default abstract class AeroSupport {
	static Caches = Caches
	static Logger = Logger
	static FileLoader = FileLoader
}
