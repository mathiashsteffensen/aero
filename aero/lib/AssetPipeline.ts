import { execSync } from "child_process"
import * as esbuild from "esbuild"
import { sassPlugin } from "esbuild-sass-plugin"
import assetsManifestPlugin from "esbuild-plugin-assets-manifest"

import fs from "fs"
import Aero from "./Aero"

/**
 * Any custom AssetPipeline implementations MUST satisfy this interface
 */
export interface IAssetPipeline {
  assetManifest: Record<
    string,
    Record<string, string>
  >
  compile(aero: typeof Aero): Promise<void>
}

/**
 * The default asset pipeline implementation that Aero ships with
 *
 * @remarks
 * The default asset pipeline bundles your TypeScript and SCSS files using ESBuild.
 * It adds a manifest to the ./public directory along with your compiled assets.
 */
export default class AssetPipeline implements IAssetPipeline {
	/**
	 * Asset manifest mapping unbundled input files, to bundled static asset paths
	 */
	assetManifest!: Record<
    string,
    Record<string, string>
  >

	/**
	 * Compiles the assets
	 */
	async compile(aero: typeof Aero) {
		try {
			// Clean output directory
			execSync("rm -rf ./public/*")

			// Compile assets
			await esbuild.build({
				minify: aero.env.isProduction(), // Only minify in production
				metafile: true, // Generate a metafile for the assetsManifestPlugin
				entryPoints: [
					"app/assets/scripts/application.ts",
					"app/assets/styles/application.scss",
				],
				entryNames: "[dir]/[name]-[hash]", // Hash output files based on content for cache-busting
				outdir: "./public",
				bundle: true,
				plugins: [
					sassPlugin(),
					assetsManifestPlugin({
						filename: "manifest.json",
						path: "./public",
					}),
				],
			})

			this.assetManifest = JSON.parse(
				fs.readFileSync(
					aero.root.join("public/manifest.json"),
				).toString(),
			)
		} catch (e) {
			aero.logger.error(e)
		}
	}
}
