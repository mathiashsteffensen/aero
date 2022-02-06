import Aero from "@aero/aero"
import { Controller } from "@aero/aero-web"
import { AuthenticatableRecord } from "../models"
import AeroRecord from "@aero/aero-record";

export class AuthHelper {
  #token?: string
  #currentId?: string
  current?: AuthenticatableRecord<any>
  constructor(private RecordClass: typeof AuthenticatableRecord, public controller: Controller) {
    controller.viewHelpers.auth = this
  }

  get token() {
    return this.#token ||= this.controller.session.get("auth-token") as string | undefined
  }

  get currentId() {
    return this.#currentId
  }

  async #setCurrentId() {
    this.#currentId ||= await Aero.cache.get<string>(this.token || "")
  }

  async setCurrent() {
    await this.#setCurrentId()

    if (!this.currentId) return

    try {
      this.current = await this.RecordClass.find(this.currentId) as AuthenticatableRecord<any>
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

    await this.#setCurrentId()
    if (!this.currentId) {
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
