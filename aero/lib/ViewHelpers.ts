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

	style_tag = (stylesheet: string) => {
		return `<link href="${stylesheet}" rel="stylesheet" />`
	}

	local_style_tag = (stylesheet: string) => {
		const asset = this.asset(stylesheet)

		const cssHref = asset.css

		if (!cssHref) {
			throw new Error(`Couldn't find stylesheet for asset with name ${stylesheet}, loaded manifest for this asset is\n${asset}`)
		}

		return this.style_tag(`/${cssHref}`)
	}

	script_tag = (script: string) => {
		return `<script src="${script}" defer async ></script>`
	}

	local_script_tag = (script: string) => {
		const asset = this.asset(script)

		const scriptHref = asset.js

		if (!scriptHref) {
			throw new Error(`Couldn't find stylesheet for asset with name ${script}, loaded manifest for this asset is\n${asset}`)
		}

		return this.script_tag(`/${scriptHref}`)
	}
}
