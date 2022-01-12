const Migration = require("../../dist/js/Migration.js").default

class RenameSomeDummyModelColumns extends Migration {
    async up() {
        await this.alterTable("dummy_models", (t) => {
            t.renameColumn("calledSendConfirmationEmail", "called_send_confirmation_email")
            t.renameColumn("calledSetId", "called_set_id")
        })
    }

    async down() {
        await this.alterTable("dummy_models", (t) => {
            t.renameColumn("called_send_confirmation_email", "calledSendConfirmationEmail")
            t.renameColumn("called_set_id", "calledSetId")
        })
    }
}

module.exports = RenameSomeDummyModelColumns
