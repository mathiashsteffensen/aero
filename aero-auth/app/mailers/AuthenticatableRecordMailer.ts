import Aero from "@aero/aero"
import AeroMailer from "@aero/aero-mailer"
import cuid from "cuid"

import { AuthenticatableRecord } from "../models"
import bcrypt from "bcrypt";

export default class AuthenticatableRecordMailer extends AeroMailer.Mailer {
  static useClass(klass: unknown) {
    return klass as typeof AuthenticatableRecord
  }
  static RecordClass: typeof AuthenticatableRecord
  get RecordClass() {
    return (this.constructor as typeof AuthenticatableRecordMailer).RecordClass
  }

  emailConfirmationLink: string | undefined
  currentDomain: string | undefined
  async confirmEmail(id: string | number, url: string) {
    const record = await this.RecordClass.find(id) as AuthenticatableRecord<any>

    this.receiver = record.email

    const emailConfirmationToken = await bcrypt.hash(cuid(), 8)

    record.emailConfirmationToken = emailConfirmationToken
    await record.save({ throwOnError: true })

    this.emailConfirmationLink = `${url}?token=${emailConfirmationToken}`
    this.currentDomain = Aero.config.web.currentDomain()

    await Aero.cache.set(`confirm-email::${emailConfirmationToken}`, record.id)

    return this.mail()
  }
}
