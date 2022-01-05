const Migration = require("../../dist/js/Migration.js").default

class AddDummyModelsTable extends Migration {
    async up() {
        await this.alterTable("dummy_models", (t) => {
            t.addColumn("string", "password")
        })
    }

    async down() {
        await this.dropTable("dummy_models")
    }
}

module.exports = AddDummyModelsTable
