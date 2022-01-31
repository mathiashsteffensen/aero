import { Transporter } from "nodemailer"

import AeroSupport from "@aero/aero-support"
import { ViewEngine } from "@aero/aero-support/lib/interfaces"

import Mailer from "./Mailer"

export default abstract class AeroMailer {
	static defaultSender = ""
	static Mailer = Mailer
	static viewEngine: ViewEngine
	static transporter: Transporter
	static logger = new AeroSupport.Logger()
}
