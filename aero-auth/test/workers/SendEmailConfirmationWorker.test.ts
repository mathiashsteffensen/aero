import SendEmailConfirmationWorker from "../../app/workers/SendEmailConfirmationWorker";
import {expect} from "chai";
import Aero from "@aero/aero";

describe("SendEmailConfirmationWorker", () => {
  const worker = new SendEmailConfirmationWorker()

  describe("#perform", () => {
    let args: Parameters<SendEmailConfirmationWorker["perform"]>[0]

    const perform = async () => {
      Aero.logger.level = "debug"
      await worker.perform(args)
    }

    it("doesn't throw an error", () => {
      expect(perform).not.to.throw(Error)
    })
  })
})
