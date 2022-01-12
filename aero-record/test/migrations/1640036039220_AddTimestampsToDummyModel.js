const Migration = require("../../dist/js/Migration.js").default

class AddTimestampsToDummyModel extends Migration {
    async up() {
        await this.alterTable("dummy_models", (t) => {
            t.timestamps()
        })
    }

    async down() {
        await this.alterTable("dummy_models", (t) => {
            t.dropColumn("created_at")
            t.dropColumn("updated_at")
        })
    }
}

module.exports = AddTimestampsToDummyModel
