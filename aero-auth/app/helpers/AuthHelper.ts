import Aero from "@aero/aero"
import { Controller } from "@aero/aero-web"
import { AuthenticatableRecord } from "../models"
import AeroRecord from "@aero/aero-record";

export class AuthHelper {
  current?: AuthenticatableRecord<any>
  constructor(private RecordClass: typeof AuthenticatableRecord, public controller: Controller) {
    controller.viewHelpers.auth = this
  }

  get token() {
    return this.controller.session.get("auth-token") as string | undefined
  }

  async currentId() {
    return await Aero.cache.get<string>(this.token || "")
  }

  async setCurrent() {
    if (!await this.currentId()) return

    try {
      this.current = await this.RecordClass.find(await this.currentId() as string) as AuthenticatableRecord<any>
    } catch (e) {
      if (e instanceof AeroRecord.Errors.RecordNotFound) {
        return
      }

      throw e
    }
  }

  async requireAuthentication() {
    if (!this.token) {
      Aero.logger.trace("Rejecting authentication due to no token")
      this.redirect()
      return
    }

    if (!await this.currentId()) {
      Aero.logger.trace("Rejecting authentication due to no record id found from token")
      this.redirect()
      return
    }

    await this.setCurrent()

    if (!this.current) {
      Aero.logger.trace("Rejecting authentication because record couldn't be found")
      this.redirect()
    }
  }

  redirect() {
    this.controller.redirectTo(Aero.config.web.currentDomain()!)
  }
}
