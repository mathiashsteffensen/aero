import { expect } from "chai"
import Mail from "@aero/aero-mailer/dist/typings/Mail"

import AuthenticatableRecordMailer from "../../app/mailers/AuthenticatableRecordMailer"
import { AuthenticatableRecord } from "../../app/models"
import Aero from "@aero/aero";

class User extends AuthenticatableRecord<User> {}
class UserMailer extends AuthenticatableRecordMailer {
  static layout = "aero-auth/application"
}

describe("AuthenticatableRecordMailer", () => {
  const mailer = new UserMailer()

  describe("#confirmEmail", async () => {
    let user: User, mail: Mail, html: string | undefined

    beforeEach(async () => {
      UserMailer.RecordClass = UserMailer.useClass(User)

      user = await User.create<User>({
        email: "ms@aero.io",
        passwordHash: "password",
      })

      mail = await mailer.confirmEmail(user.id, Aero.routes.make.confirm_email?.().toString() || "")
      html = await mail.preview()

      await user.reload()
    })

    it("renders an email with the email confirmation token", async () => {
      expect(html?.includes(user.emailConfirmationToken as string)).to.be.true
      expect(await Aero.cache.get(`confirm-email::${user.emailConfirmationToken}`)).to.eq(user.id)
    })
  })
})
