import AeroJob from "@aero/aero-job"
import AuthenticatableRecordMailer from "../mailers/AuthenticatableRecordMailer"

export default class SendEmailConfirmationWorker extends AeroJob.Worker {
  static mailer: AuthenticatableRecordMailer
  get mailer() {
    return (this.constructor as typeof SendEmailConfirmationWorker).mailer
  }

  async perform(
    { id, confirmEmailLink }: {
      id: string | number
      confirmEmailLink: string
    }
  ) {
    await this
      .mailer
      .confirmEmail(id, confirmEmailLink)
      .then(
        async (m) => {
          console.log(await m.send())

          return m.send()
        }
      )
  }
}
