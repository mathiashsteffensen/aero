import "jake"
import Aero from "../Aero"
import * as path from "path"

const sh = (cmd: string) =>
	new Promise((resolve) => jake.exec(
		[cmd],
		() => resolve(undefined),
		{ printStdout: true },
	))

desc("Starts the Aero server")
task("s" , async () => {
	if (Aero.env.isDevelopment()) {
		await sh(`./node_modules/.bin/pm2 start start.ts -n ${path.basename(process.cwd())} --no-daemon --watch . --ignore-watch public`)
	}
})
