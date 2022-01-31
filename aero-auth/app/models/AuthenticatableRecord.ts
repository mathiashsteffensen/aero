import bcrypt from "bcrypt"
import cuid from "cuid"

import AeroRecord from "@aero/aero-record"

import { BaseRecord } from "./BaseRecord"
import Aero from "@aero/aero";
import { SaveOptions, ConstructorArgs } from "@aero/aero-record/dist/typings/types"

export abstract class AuthenticatableRecord<TRecord extends AuthenticatableRecord<TRecord>> extends BaseRecord<TRecord> {
    /* Attributes */
    @AeroRecord.Decorators.validates({
        present: true,
        unique: true,
    })
    email!: string

    @AeroRecord.Decorators.hasEncryptedPassword()
    @AeroRecord.Decorators.validates({
        present: true,
    })
    passwordHash!: string

    emailConfirmationToken?: string

    emailConfirmedAt?: Date
    lastLoginAt?: Date

    /* Hooks */
    @AeroRecord.Decorators.after("create")
    async sendEmailConfirmation() {
        // TODO: Implement actual email sending
    }

    /* Helper methods */
    static findByEmail<TRecord extends AuthenticatableRecord<TRecord>>(email: string) {
        return this.findBy<TRecord>({email} as unknown as ConstructorArgs<TRecord>)
    }

    async isValidPassword(password: string) {
        return bcrypt.compare(
          password,
          this.passwordHash
        )
    }

    static async login<TRecord extends AuthenticatableRecord<TRecord>>(email: string, password: string, ttl = 1000 * 60 * 60 * 24 * 7): Promise<[TRecord, string | undefined]> {
        let record = await this.findByEmail<TRecord>(email)

        if (!record) {
            record = this.new<TRecord>()
            record.errors.add("email", new AeroRecord.Errors.AeroRecordError("Invalid email or password"))
            return [record, undefined]
        }

        if (!(await record.isValidPassword(password))) {
            record = this.new<TRecord>()
            record.errors.add("email", new AeroRecord.Errors.AeroRecordError("Invalid email or password"))
            return [record, undefined]
        }

        // Register a session token in the cache and return it with the record
        const token = await bcrypt.hash(cuid(), 8)

        await Aero.cache.set(token, record.id, { ttl }) // Token will correspond to the record id
        return [record, token]
    }

    save(options?: SaveOptions): Promise<boolean> {
        return super.save(options)
    }
}
