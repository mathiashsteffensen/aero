import { expect } from "chai"

import { AuthenticatableRecord } from "../../app/models"
import { ConstructorArgs } from "@aero/aero-record/dist/typings/types"
import Aero from "@aero/aero";

class User extends AuthenticatableRecord<User> {}

describe("AuthenticatableRecord", () => {
  describe("#create", () => {
    let user: User, args: ConstructorArgs<User>
    const doCreate = async () => user = await User.create(args)

    context("when not supplying an email", () => {
      beforeEach(async () => {
        args = {
          passwordHash: "password",
        }
        await doCreate()
      })

      it("registers an error", () => {
        expect(user.errors.any()).to.be.true
      })
    })

    context("when not supplying a password", () => {
      beforeEach(async () => {
        args = {
          email: "ms@aero.io",
        }
        await doCreate()
      })

      it("registers an error", () => {
        expect(user.errors.any()).to.be.true
      })
    })

    context("when supplying all required attributes", () => {
      beforeEach(async () => {
        args = {
          email: "ms@aero.io",
          passwordHash: "password",
        }
        await doCreate()
      })

      it("persists the record", () => {
        expect(user.isPersisted).to.be.true
      })

      it("hashes the password", () => {
        expect(user.passwordHash).not.to.eq("password")
      })

      it("sets an email confirmation token", () => {
        expect(user.emailConfirmationToken).not.to.be.undefined
      })
    })
  })

  describe("#login", () => {
    let user: User

    beforeEach(async () => {
      user = await User.create({
        email: "ms@aero.io",
        passwordHash: "password",
      })
    })

    let email: string, password: string, res: [User, string | undefined]
    const doLogin = async () => res = await User.login(email, password)

    context("when supplying an incorrect email", () => {
      beforeEach(async () => {
        email = "wrong@example.com"
        password = "password"
        await doLogin()
      })

      it("adds a validation error", () => {
        expect(res[0].errors.any()).to.be.true
      })

      it("doesn't return a token", () => {
        expect(res[1]).to.be.undefined
      })
    })

    context("when supplying an incorrect password", () => {
      beforeEach(async () => {
        email = "ms@aero.io"
        password = "wrong-pass"
        await doLogin()
      })

      it("adds a validation error", () => {
        expect(res[0].errors.any()).to.be.true
      })

      it("doesn't return a token", () => {
        expect(res[1]).to.be.undefined
      })
    })

    context("when supplying correct email and password", () => {
      beforeEach(async () => {
        email = "ms@aero.io"
        password = "password"
        await doLogin()
      })

      it("returns the record", () => {
        expect(res[0]).to.deep.eq(user)
      })

      it("returns a valid token", async () => {
        const token = res[1]
        expect(token).not.to.be.undefined
        expect(await Aero.cache.get(token || "")).to.eq(user.id)
      })
    })
  })
})
