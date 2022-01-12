const Migration = require("../../dist/js/Migration.js").default

class AddDummyModelsTable extends Migration {
    async up() {
        await this.createTable("dummy_models", (t) => {
            t.id("string")

            t.addColumn("string", "name")
            t.addColumn("string", "email")
            t.addColumn("integer", "calledSetId", { default: 0 })
            t.addColumn("integer", "calledSendConfirmationEmail", { default: 0 })
        })
    }

    async down() {
        await this.dropTable("dummy_models")
    }
}

module.exports = AddDummyModelsTable
