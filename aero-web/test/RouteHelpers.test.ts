import * as assert from "assert"
import RouteHelpers from "../lib/RouteHelpers"
import { RouteState } from "../lib/types"

describe(RouteHelpers.name, () => {
	let routeHelpers: RouteHelpers
	let routes: RouteState

	beforeEach(() => {
		routeHelpers = new RouteHelpers(routes)
	})

	context("when constructing a plain route with no params", () => {
		context("when not passing an explicit name", () => {
			before(() => {
				routes = [{
					method: "GET",
					path: "/session/new",
					options: {},
					spec: "",
				}]
			})

			it("just returns the plain path based on the inferred name", () => {
				assert.equal(routeHelpers.session_new?.()?.toString(), "https://localhost:8080/session/new")
			})
		})

		context("when passing an explicit name", () => {
			before(() => {
				routes = [{
					method: "GET",
					path: "/session/new",
					options: {
						as: "new_session",
					},
					spec: "",
				}]
			})

			it("returns the plain path based on the passed name", () => {
				assert.equal(routeHelpers.new_session?.()?.toString(), "https://localhost:8080/session/new")
			})
		})
	})

	context("when constructing a route with params", () => {
		before(() => {
			routes = [{
				method: "GET",
				path: "/user/:id",
				options: {
					as: "user",
				},
				spec: "",
			}]
		})

		context("when not passing any replacements", () => {
			it("returns the path with the named parameter still in it", () => {
				assert.equal(routeHelpers.user?.()?.toString(), "https://localhost:8080/user/:id")
			})
		})

		context("when passing a replacement for the id param", () => {
			it("replaces the named param with the given value", () => {
				assert.equal(
					routeHelpers.user?.({ id: "ckxkf9h2b00000s8hcr24c5hk" })?.toString(),
					"https://localhost:8080/user/ckxkf9h2b00000s8hcr24c5hk",
				)
			})
		})
	})
})
