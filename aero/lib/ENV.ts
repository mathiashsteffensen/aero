/**
 * Provides helpers for dealing with process.env values, an instance is available in your application as `Aero.env`
 */
export class ENVError extends Error {}

export default class ENV {
	static VALID_ENVS = ["test", "development", "staging", "production"]

	/**
   * @internal
   */
	#currentEnv?: string

	/**
   * Get the current environment as a string, e.g. "development"
   */
	toString() {
		return this.#currentEnv ||= this.fetch("NODE_ENV", "development")
	}

	/**
   * Fetch a key from process.env
   *
   * @remarks
   * If no default value is provided and no value is found in the environment, an ENVError will be thrown
   * because it is assumed your application requires these values
   *
   * @param key - the key to fetch from the environment
   * @param defaultValue - optional default value to return if none is found in process.env
   *
   * @example
   * ```
   *   const maxDbPool = Aero.env.fetch("MAX_DB_POOL", "5")
   *   const minDbPool = Aero.env.fetch("MIN_DB_POOL", "1")
   * ```
   */
	fetch(key: string, defaultValue?: string) {
		const value = process.env[key]

		if (!value) {
			if (defaultValue) {
				return defaultValue
			} else {
				throw new ENVError(`Key ${key} not found in environment, and no default value was provided`)
			}
		} {
			return value
		}
	}

	/**
	 * Checks if the current NODE_ENV === "test"
	 */
	isTest() {
		return this.toString() === "test"
	}

	/**
	 * Checks if the current NODE_ENV === "development"
	 */
	isDevelopment() {
		return this.toString() === "development"
	}

	/**
	 * Checks if the current NODE_ENV === "staging"
	 */
	isStaging() {
		return this.toString() === "staging"
	}

	/**
	 * Checks if the current NODE_ENV === "production"
	 */
	isProduction() {
		return this.toString() === "production"
	}
}
