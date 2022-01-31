import AeroMailer from "./AeroMailer"
import Mailer from "./Mailer"
import { juiceResources } from "juice"

const juice = async (html: string) => {
	return new Promise<string>((resolve, reject) => {
		juiceResources(html, {}, (err, inlined) => {
			if (err) reject(err)
			resolve(inlined)
		})
	})
}

export default class Mail {
	readonly #html?: Promise<string>

	constructor(
    private Class: typeof Mailer,
    private instance: Mailer,
    private template: string,
	) {
		this.#html = this.#render()
	}

	async #render() {
		const html = await AeroMailer.viewEngine.render(`layouts/${this.Class.layout}`, {
			yield: await AeroMailer.viewEngine.render(`${this.Class.templateDir}/${this.template}`, this.instance),
		})

		return await juice(html)
	}

	async preview() {
		return this.#html
	}

	async send() {
		const info = await AeroMailer.transporter.sendMail({
			from: this.Class.sender,
			to: this.instance.receiver,
			subject: this.instance.subject,
			html: await this.#html,
		})

		AeroMailer.logger.info({
			id: info.messageId,
			subject: this.instance.subject,
		}, `${this.Class.templateDir}/${this.template} sent`)
	}
}
