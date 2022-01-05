import { RouteSpecification } from "./RouteSpecification"
import { RouteOptions } from "./RouteOptions"
import { HTTPMethod } from "./HTTPMethod"

export type RouteState = Array<{
  method: HTTPMethod
  path: string
  spec: RouteSpecification
  options: RouteOptions
}>
