import { expect } from "chai"

import Aero from "@aero/aero"
import AeroTest, { TestResponse } from "@aero/aero/lib/AeroTest"
import AuthenticatableRecordController from "../../app/controllers/AuthenticatableRecordController"
import { AuthenticatableRecord } from "../../app/models"
import AuthHelper from "../AuthHelper";

class User extends AuthenticatableRecord<User> {}
class UsersController extends AuthenticatableRecordController {
  static RecordClass = this.useClass(User)
}

AeroTest.wrap(describe, AuthenticatableRecordController, ({ post, get }) => {
  before(() => {
    Aero.application.controllers.set("users", UsersController)

    Aero.routes.draw((r) => {
      UsersController.mount(r)
    })
  })

  let response: TestResponse | undefined

  describe("#create", () => {
    let params: {
      email?: string
      password?: string
    } = {}

    let beforePost: (() => Promise<void>) | undefined

    beforeEach(async () => {
      await beforePost?.()
      response = await post(
        Aero.routes.make.create_user?.()?.path || "",
        {
          user: params
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

      context("when email is already taken", () => {
        before(() => {
          beforePost = async () => {
            await User.create({
              email: params.email,
              passwordHash: params.password,
            }, { throwOnError: true })
          }
        })

        it("responds with status 400", () => {
          expect(response?.statusCode).to.eq(400)
        })
      })
    })
  })

  describe("#destroy", () => {
    let path: string

    before(() => {
      path = Aero.routes.make.destroy_user?.()?.path || ""
    })

    let user: User

    beforeEach(async () => {
      Aero.logger.level = "trace"
      user = await User.create<User>({
        email: "ms@aero.io",
        passwordHash: "password",
      })

      await AuthHelper.authenticateRecord(user, "password")

      response = await post(path)
    })

    it("destroys the record", async () => {
      expect(await User.findBy({ id: user.id })).to.be.undefined
    })
  })

  describe("#login", () => {
    let path: string

    before(() => {
      path = Aero.routes.make.login_user?.()?.path || ""
    })

    describe("GET", () => {
      beforeEach(async () => {
        response = await get(path)
      })

      it("responds with status 200", () => {
        expect(response?.statusCode).to.eq(200)
      })

      it("renders a form", () => {
        expect(response?.body || "").to.include("<form")
      })
    })

    describe("POST", () => {
      let params = {
        email: "ms@aero.io",
        password: "password",
      }
      let beforePost: (() => Promise<void>) | undefined

      beforeEach(async () => {
        await beforePost?.()
        response = await post(path, { user: params })
      })

      describe("with invalid credentials", () => {
        it("responds with the login form", () => {
          expect(response?.body || "").to.include("<form")
        })
      })

      describe("with valid credentials", () => {
        before(() => {
          beforePost = async () => {
            await User.create({
              email: params.email,
              passwordHash: params.password,
            }, { throwOnError: true })
          }
        })

        it("responds with a redirect", () => {
          expect(response?.statusCode).to.eq(303)
        })
      })
    })
  })
})
