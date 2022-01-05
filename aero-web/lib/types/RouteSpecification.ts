import { RouteHandler } from "./RouteHandler"

export type RouteSpecification = string | {
  controller: string
  action: string
} | RouteHandler
