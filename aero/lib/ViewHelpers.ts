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
}
