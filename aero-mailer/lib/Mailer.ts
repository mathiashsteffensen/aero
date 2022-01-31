import AeroSupport from "@aero/aero-support"
import AeroMailer from "./AeroMailer"
import Mail from "./Mail"

export default class Mailer {
	static get sender() {
		return AeroMailer.defaultSender
	}
	static layout = "application"
	static get templateDir() {
		return AeroSupport.Helpers.toSnakeCase(this.name).split("_mailer")[0]
	}

	receiver: string | Array<string> = ""
	subject = ""

	mail(template?: string) {
		return template
			? new Mail(
					this.constructor as typeof Mailer,
					this,
					template,
			)
			// Returning undefined will be caught by the Proxy and return a Mail instance instead
			// So force type-checking to return a Mail instance
			: undefined as unknown as Mail
	}

	constructor() {
		return new Proxy(this, {
			get(target: Mailer, propertyKey: keyof Mailer): any {
				const property = target[propertyKey] as unknown

				if (typeof property !== "function") {
					return property
				}

				return async (...args: Array<unknown>) => {
					const result = await property.call(target, ...args)

					if (result !== undefined) {
						return result
					}

					return new Mail(
						target.constructor as typeof Mailer,
						target,
						AeroSupport.Helpers.toSnakeCase(propertyKey),
					)
				}
			},
		})
	}
}
