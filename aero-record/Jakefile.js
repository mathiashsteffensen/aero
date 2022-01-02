const { task, desc } = require("jake")
const { execSync } = require("child_process")

const sh = (cmd) => execSync(cmd, {stdio: "inherit"})

desc("Generate new documentation")
task("docs", () => {
    sh("npx typedoc --out ../doc/aero-record --entryPointStrategy expand --disableSources  ./lib/*ts ./lib/**/*.ts")
})
