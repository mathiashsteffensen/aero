import { expect } from "chai"

import AeroMailer from "../lib/AeroMailer"
import Mail from "../lib/Mail"

describe("AeroMailer", () => {
	describe(".Mailer", () => {
		class ExampleMailer extends AeroMailer.Mailer {
			sendMail() {
				this.receiver = "ms@aero.io"
				this.subject = "Hello World!"

				return this.mail()
			}
		}

		describe(".templateDir", () => {
			class OtherExample extends AeroMailer.Mailer {}

			describe("ExampleMailer", () => {
				it("returns 'example'", () => {
					expect(ExampleMailer.templateDir).to.eq("example")
				})
			})

			describe("OtherExample", () => {
				it("returns 'other_example'", () => {
					expect(OtherExample.templateDir).to.eq("other_example")
				})

				context("when customized", () => {
					class OtherExample extends AeroMailer.Mailer {
						static get templateDir() {
							return "custom"
						}
					}

					it("returns 'custom'", () => {
						expect(OtherExample.templateDir).to.eq("custom")
					})
				})
			})
		})

		describe("sending mail", () => {
			const mailer = new ExampleMailer()

			it("returns an instanceof Mail", async () => {
				expect(await mailer.sendMail()).to.be.instanceof(Mail)
			})
		})
	})
})
