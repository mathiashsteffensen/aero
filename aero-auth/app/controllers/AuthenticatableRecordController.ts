import { BaseController } from "./BaseController"
import { AuthenticatableRecord } from "../models"
import AuthenticatableRecordMailer from "../mailers/AuthenticatableRecordMailer";
import SendEmailConfirmationWorker from "../workers/SendEmailConfirmationWorker";
import Aero from "@aero/aero";

export default class AuthenticatableRecordController extends BaseController {
  static useClass(klass: unknown) {
    return klass as typeof AuthenticatableRecord
  }
  static RecordClass: typeof AuthenticatableRecord
  get RecordClass() {
    return (this.constructor as typeof AuthenticatableRecordController).RecordClass
  }

  get MailerClass() {
    const Record = this.RecordClass

    return class Mailer extends AuthenticatableRecordMailer {
      static RecordClass = Record
    }
  }

  get emailConfirmationWorker() {
    const mailer = new this.MailerClass()

    return class Worker extends SendEmailConfirmationWorker {
      static mailer = mailer
    }
  }

  record!: AuthenticatableRecord<any>

  show() {}

  new() {}

  async create() {
    const params = this.createParams

    this.record = this.RecordClass.new({
      email: params.email,
      passwordHash: params.password,
    }) as AuthenticatableRecord<any>

    if (await this.record.save()) {
      await this.emailConfirmationWorker.performAsync({
        id: this.record.id,
        confirmEmailLink: Aero.routes.make.confirm_email?.(),
      })

      return this.render("show")
    } else {
      this.res.status(400)
      return this.render("new")
    }
  }

  edit() {}

  update() {}

  get createParams() {
    return this.params.validate<{
      [tableName: string]: {
        email: string
        password: string
      }
    }>({
      [this.RecordClass.tableName]: {
        type: "object",
        required: true,
        properties: {
          email: { type: "string" },
          password: { type: "string" }
        }
      }
    },
    {
      additionalProperties: true
    })[this.RecordClass.tableName]!
  }
}
