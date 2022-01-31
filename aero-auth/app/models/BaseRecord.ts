import cuid from "cuid"

import AeroRecord from "@aero/aero-record";

export abstract class BaseRecord<TRecord extends BaseRecord<TRecord>> extends AeroRecord.Base<TRecord> {
  id!: string
  createdAt?: Date
  updatedAt?: Date

  @AeroRecord.Decorators.before("create")
  setId() {
    this.id = cuid()
  }
}
