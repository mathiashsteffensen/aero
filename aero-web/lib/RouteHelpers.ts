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

export default class RouteHelpers {

	[name: string]: (replacements?: Record<string, unknown>) => string

	constructor(routes: RouteState) {
		for (const route of routes) {
			this[route.options.as || inferNameFromPath(route.path)] = (replacements: Record<string, unknown> = {}) => {
				let constructedPath = route.path

				for (const replacementsKey in replacements) {
					const replacementValue = (replacements[replacementsKey] as { toString: () => string }).toString()
					constructedPath = constructedPath.replace(
						`:${replacementsKey}`,
						replacementValue,
					)
				}

				return `${AeroWeb.config.currentDomain()}${constructedPath}`
			}
		}
	}
}
