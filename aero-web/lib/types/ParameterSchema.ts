import { ParamType } from "./ParamType"

export type ParameterSchema<T> = {
  [Key in keyof T]: {
    type: ParamType
    required?: boolean
    properties?: {
      [nestedKey in keyof T[Key]]: {
        type: ParamType
        required?: boolean
      }
    }
  }
}
