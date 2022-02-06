const Migration = require("../../dist/js/Migration.js").default

class AddTimestampsToDummyModel extends Migration {
    async up() {
        await this.createTable("users", (t) => {
            t.id("string")

            t.timestamps()
        })

        await this.alterTable("dummy_models", (t) => {
            t.addColumn("string", "user_id")
        })
    }

    async down() {
        await this.dropTable("users")

        await this.alterTable("dummy_models", (t) => {
            t.dropColumn("user_id")
        })
    }
}

module.exports = AddTimestampsToDummyModel
