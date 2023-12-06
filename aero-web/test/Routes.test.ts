import pino from "pino"
import * as assert from "assert"

import { RouteState } from "../lib/types"

import Controllers from "../lib/Controllers"
import RouteBuilder from "../lib/RouteBuilder"
import Routes from "../lib/Routes"
import Server from "../lib/Server"

describe("Routes", () => {
	let routes: Routes
	const controllers = new Controllers()
	const server = new Server({
		logger: pino(),
		staticDir: "",
		staticDirPathPrefix: "/",
	})

	beforeEach(() =>
		routes = new Routes(
			controllers,
			server,
			{
				async render() { return "" },
				// eslint-disable-next-line no-console
				async load(d: string) { console.log(d) },
			},
			{},
		),
	)

	describe("#addRoute", () => {
		const args: {
			route: RouteState[0]
			scope: string
		} = {
			route: {
				path: "",
				method: "GET",
				spec: (_, res) => {
					res.send("Hello World")
				},
				options: {},
			},
			scope: "",
		}

		beforeEach(() => {
			routes.addRoute(args.route, args.scope)
		})

		const testRouteVariations = () => {
			context("when path starts with a '/'", () => {
				before(() => {
					args.route.path = "/world"
				})

				it("adds the route", () => {
					assert.equal(routes.state[0]?.path, "/hello/world")
				})
			})

			context("when path doesn't start with a '/'", () => {
				before(() => {
					args.route.path = "world"
				})

				it("adds the route", () => {
					assert.equal(routes.state[0]?.path, "/hello/world")
				})
			})

			context("when path starts and ends with a '/'", () => {
				before(() => {
					args.route.path = "/world/"
				})

				it("adds the route", () => {
					assert.equal(routes.state[0]?.path, "/hello/world/")
				})
			})
		}

		context("when scope doesn't start with a '/' or '*' or ends with a '/'", () => {
			args.scope = "hello"

			testRouteVariations()
		})

		context("when scope doesn't start with a '/' or '*' and ends with a '/'", () => {
			args.scope = "hello/"

			testRouteVariations()
		})

		context("when scope starts with a '/' and ends with a '/'", () => {
			args.scope = "/hello/"

			testRouteVariations()
		})
	})

	describe("#draw", () => {
		let drawFunc: (r: RouteBuilder) => void

		beforeEach(() => {
			routes.draw(drawFunc)
		})

		describe("example test case from BOOKTID.NET", () => {
			before(() => {
				drawFunc = (r) => {
					r.namespace("dashboard", (r) => {
						r.namespace("auth", (r) => {
							r.post("sign-up", () => {
								// eslint-disable-next-line no-console
								console.log("someone is signing up")
							})
						})
					})
				}
			})

			it("registers the route", () => {
				assert.equal(routes.state[0]?.path, "/dashboard/auth/sign-up")
			})
		})
	})
})
