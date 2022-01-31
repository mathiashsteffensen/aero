const Migration = require("@aero/aero-record/dist/js/Migration.js").default

class CreateAuthenticatableRecordMigration extends Migration {
    async up(tableName = "users") {
        await this.createTable(tableName, (t) => {
            t.id("string")

            t.addColumn("string", "email", { null: false })
            t.addColumn("string", "password_hash", { null: false })
            t.addColumn("string", "email_confirmation_token")

            t.addColumn("timestamp", "email_confirmed_at")
            t.addColumn("timestamp", "last_login_at")
            t.timestamps()
        })
    }

    async down(tableName) {
        await this.dropTable(tableName)
    }
}

module.exports = CreateAuthenticatableRecordMigration
