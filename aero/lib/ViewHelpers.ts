import { SetCacheOptions } from "@aero/aero-support/dist/typings/interfaces"
import Aero from "./Aero"

export default class ViewHelpers {
	assetManifest: Record<
    string,
    Record<string, string>
  >

	constructor(
		assetManifest: Record<
			string,
			Record<string, string>
		>,
	) {
		this.assetManifest = assetManifest
	}

	asset = (name: string) => {
		const asset = this.assetManifest[name]

		if (!asset) {
			throw new Error(`Couldn't find asset with name ${name}, loaded manifest is\n${this.assetManifest}`)
		}

		return asset
	}

	styleTag = (stylesheet: string) => {
		return `<link href="${stylesheet}" rel="stylesheet" />`
	}

	localStyleTag = (stylesheet: string) => {
		const asset = this.asset(stylesheet)

		const cssHref = asset.css

		if (!cssHref) {
			throw new Error(`Couldn't find stylesheet for asset with name ${stylesheet}, loaded manifest for this asset is\n${asset}`)
		}

		return this.styleTag(`/${cssHref}`)
	}

	scriptTag = (script: string) => {
		return `<script src="${script}" defer async ></script>`
	}

	localScriptTag = (script: string) => {
		const asset = this.asset(script)

		const scriptHref = asset.js

		if (!scriptHref) {
			throw new Error(`Couldn't find stylesheet for asset with name ${script}, loaded manifest for this asset is\n${asset}`)
		}

		return this.scriptTag(`/${scriptHref}`)
	}

	linkTo = (text: string, url: string, options: { class?: string, } = {}) => (`
		<a 
			class="${options.class || ""}"
			href="${url}"
		>
			${text}
		</a>
	`)

	buttonTo = (text: string, url: string, options: { class?: string, method?: string } = {}) => (`
		<form
			action="${url}"
			method="${options.method || "POST"}"
		>
			<button
				class="${options.class || ""}"
			>
				${text}
			</button>
		</form>	
	`)

	cache = (key: string, callback: () => string | Promise<string>, options: SetCacheOptions = {}) => {
		return Aero.cache.fetch(
			key,
			callback as () => Promise<string>,
			options,
		)
	}
}
