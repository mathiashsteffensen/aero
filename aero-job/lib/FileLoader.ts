import * as fs from "fs"

export default class FileLoader {
	readonly dir: string
	readonly files: Array<string> = []

	constructor(dir: string) {
		this.dir = dir
	}

	load() {
		this.loadDir(this.dir)
	}

	private loadDir(dir: string) {
		for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
			if (f.isDirectory()) {
				this.loadDir(`${dir}/${f.name}`)
			} else {
				this.files.push(`${dir}/${f.name}`)
			}
		}
	}
}
