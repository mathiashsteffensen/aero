import { AuthenticatableRecord } from "../app/models"
import Aero from "@aero/aero"

export default abstract class AuthHelper {

  static async authenticateRecord<TRecord extends AuthenticatableRecord<TRecord>>(
    record: TRecord,
    password: string,
    loginPath = Aero.routes.make[`login_${record.constructor.name.toLowerCase()}`]?.() || Aero.routes.make[`login_${(record.constructor as typeof AuthenticatableRecord).tableName}`]?.()
  ) {
    const loginResponse = await Aero.application.server.fastify.inject({
      method: "POST",
      path: loginPath?.path || "",
      payload: {
        [record.constructor.name.toLowerCase()]: {
          email: record.email,
          password,
        }
      },
    })

    if (loginResponse.statusCode >= 400) {
      throw new Error(`Failed to authenticate ${record.constructor.name} with email = '${record.email}' & password = '${password}'`)
    }

    console.log(loginResponse.headers)
  }
}
