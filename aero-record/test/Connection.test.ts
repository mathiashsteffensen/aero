import * as assert from "assert"

import AeroRecord from "../lib/AeroRecord"

describe("AeroRecord", () => {
	describe(".Connection", () => {
		describe("#readConfig", () => {
			it("correctly reads the config file", () => {
				assert.equal(Object.keys(AeroRecord.connection.config).length, 1)
				assert.equal(Object.keys(AeroRecord.connection.config)[0], "test")
			})
		})

		describe("#establishConnection", () => {
			describe("when connection name has no defined configuration", () => {
				it("throws an error", () => {
					assert.throws(() => AeroRecord.establishConnection("doesnt_exist"), AeroRecord.Errors.ConnectionError)
				})
			})
		})
	})
})
