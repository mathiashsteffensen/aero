import { RouteState } from "./types"
import AeroWeb from "./AeroWeb"

const inferNameFromPath = (path: string) => {
	let name = path

	// Remove leading slash from name
	if (path.startsWith("/")) {
		name = name.slice(1)
	}

	// Removes trailing slash from name
	if (path.endsWith("/")) {
		name = name.slice(0, path.length - 2)
	}

	name = name.replaceAll("/", "_")

	return name.replaceAll("-", "_")
}

export class RouteString extends String {
	#parsed: URL

	get protocol() {
		return this.#parsed.protocol
	}

	get path() {
		return this.#parsed.pathname
	}

	get host() {
		return this.#parsed.host
	}

	toString() {
		return this.full
	}

	constructor(public full: string) {
		super()
		this.#parsed = new URL(full)
	}
}

export default class RouteHelpers {

	[name: string]: (replacements?: Record<string, unknown>) => RouteString

	constructor(routes: RouteState) {
		for (const route of routes) {
			const name = route.options.as || inferNameFromPath(route.path)

			this[name] = this.#generateRouteGetter(route)
		}
	}

	#generateRouteGetter(route: RouteState[0]) {
		return (replacements: Record<string, unknown> = {}) => {
			let constructedPath = route.path

			for (const replacementsKey in replacements) {
				const replacementValue = (replacements[replacementsKey] as { toString: () => string }).toString()
				constructedPath = constructedPath.replace(
					`:${replacementsKey}`,
					replacementValue,
				)
			}

			return new RouteString(`${AeroWeb.config.currentDomain()}${constructedPath}`)
		}
	}
}
