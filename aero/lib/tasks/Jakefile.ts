import "jake"
import CLI from "../CLI"

const sh = (cmd: string) =>
	new Promise((resolve) => jake.exec(
		[cmd],
		() => resolve(undefined),
		{ printStdout: true },
	))

desc("Starts the Aero server")
task("s" , async () => {
	await sh(CLI.SERVE_COMMAND)
})
