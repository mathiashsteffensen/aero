import "jake"
import Aero from "../Aero"

const sh = (cmd: string) =>
	new Promise((resolve) => jake.exec(
		[cmd],
		() => resolve(undefined),
		{ printStdout: true },
	))

desc("Starts the Aero server")
task("s" , async () => {
	await sh(`./node_modules/.bin/pm2 start config/process.${Aero.env.toString()}.config.js --no-daemon`)
})
