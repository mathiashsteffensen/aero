import AuthenticatableRecordController from "./AuthenticatableRecordController"
import { User } from "../models"

export default class UsersController extends AuthenticatableRecordController {
  static RecordClass = this.useClass(User)
}
