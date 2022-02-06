const NODE_ENV = process.env.NODE_ENV || "development"

export default class Config {
	host = "localhost"
	port = 8080
	secretKeyFile = "config/master.key"
	enabledDomains = [`http${NODE_ENV === "development" ? "" : "s"}://${this.host}:${this.port}`]
	currentDomain = () => {
		return this.enabledDomains[0]
	}
}
