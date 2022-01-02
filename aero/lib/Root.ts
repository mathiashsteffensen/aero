import * as path from "path"

/**
 * Path helper for your app, an instance is available as `Aero.root`
 */
export default class Root {
	/**
   * Construct a path from the root of your application
   *
   * @param paths -  variadic argument of the paths to join with root
   */
	join(...paths: Array<string>): string {
		return path.resolve("./", ...paths)
	}
}
