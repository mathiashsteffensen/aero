module.exports = {
    apps : [
        {
            name: "aero-web",
            script: "./start.ts",
            watch: ["app", "config", "node_modules"]
        }
    ]
}
