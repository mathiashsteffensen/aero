import { expect } from "chai"

import Aero from "@aero/aero"
import AeroTest, { TestResponse } from "@aero/aero/lib/AeroTest"
import AuthenticatableRecordController from "../../app/controllers/AuthenticatableRecordController"
import { AuthenticatableRecord } from "../../app/models"

class User extends AuthenticatableRecord<User> {}
class UsersController extends AuthenticatableRecordController {
  static RecordClass = this.useClass(User)
}

AeroTest.wrap(describe, AuthenticatableRecordController, ({ post }) => {
  before(() => {
    Aero.application.controllers.set("users", UsersController)

    Aero.routes.draw((r) => {
      r.resource("user")
    })
  })

  describe("#create", () => {
    let response: TestResponse | undefined
    let params: {
      email?: string
      password?: string
    } = {}

    beforeEach(async () => {
      response = await post(
        Aero.routes.make.create_user?.() || "",
        {
          users: params
        },
      )
    })

    context("with empty params", () => {
      before(() => {
        params = {
          email: "",
          password: "",
        }
      })

      it("responds with status 400", () => {
        expect(response?.statusCode).to.eq(400)
      })
    })

    context("with valid params", () => {
      before(() => {
        params = {
          email: "ms@aero.io",
          password: "password",
        }
      })

      it("responds with status 200", () => {
        expect(response?.statusCode).to.eq(200)
      })
    })
  })
})
