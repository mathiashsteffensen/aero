export default class Config {
	logLevel?: string

	loadDefaults() {
		this.logLevel ||= "info"
	}
}
