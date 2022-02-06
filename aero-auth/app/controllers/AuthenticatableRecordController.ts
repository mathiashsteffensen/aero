import pluralize from "pluralize"

import Aero from "@aero/aero"
import RouteBuilder from "@aero/aero-web/dist/typings/RouteBuilder"
import AeroWeb from "@aero/aero-web"

import { BaseController } from "./BaseController"
import { AuthenticatableRecord } from "../models"
import AuthenticatableRecordMailer from "../mailers/AuthenticatableRecordMailer"
import SendEmailConfirmationWorker from "../workers/SendEmailConfirmationWorker"
import { AuthHelper } from "../helpers"

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

  static mount(r: RouteBuilder) {
    if (!this.RecordClass) return

    const resourceName = pluralize.singular(this.RecordClass.tableName)

    r.resource(resourceName)
    r.scope(resourceName, (r) => {
      r.get("login", `${this.controllerName}#login`)
      r.post("login", `${this.controllerName}#login`, { as: `login_${resourceName}` })
      r.post("logout", `${this.controllerName}#logout`, { as: `logout_${resourceName}` })
    })
  }

  auth = new AuthHelper(this.RecordClass, this)

  @AeroWeb.Decorators.beforeAction<AuthenticatableRecordController>({
    except: ["new", "create", "login"]
  })
  requireAuthentication() { return this.auth.requireAuthentication() }

  async show() {
    this.record = this.auth.current!
  }

  new() {
    this.record = this.RecordClass.new() as AuthenticatableRecord<any>
  }

  async create() {
    const params = this.createParams

    this.record = this.RecordClass.new({
      passwordHash: params.password,
      ...params
    }) as AuthenticatableRecord<any>

    delete this.record["password" as keyof AuthenticatableRecord<any>]

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

  async destroy() {
    await this.auth.requireAuthentication()

    await this.auth.current?.destroy()

    this.redirectTo(Aero.routes.make.new_user!().full)
  }

  async login() {
    await this.auth.setCurrent()

    if (this.req.method === "GET") {
      if (this.auth.current) {
        this.record = this.auth.current
        this.redirectTo(Aero.routes.make.user!().full)
        return
      }
      this.record = this.RecordClass.new() as AuthenticatableRecord<any>
      return
    }

    const [record, token] = await this.RecordClass.login(
      this.createParams.email,
      this.createParams.password
    )
    this.record = record

    if (record.errors.any()) {
      return
    }

    this.session.set("auth-token", token)

    this.redirectTo(Aero.routes.make.user!().full)
  }

  async logout() {
    await this.auth.requireAuthentication()

    this.session.delete()

    await Aero.cache.delete(this.auth.token!)

    this.redirectTo(Aero.routes.make.login_user?.().full!)
  }

  get createParams() {
    const singularTableName = pluralize.singular(this.RecordClass.tableName)

    return this.params.validate<{
      [tableName: string]: {
        email: string
        password: string
      }
    }>({
      [singularTableName]: {
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
    })[singularTableName]!
  }
}
