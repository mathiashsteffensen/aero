import { RouteHandlerMethod } from "fastify"
import { IncomingMessage, Server, ServerResponse } from "http"
import { RouteGenericInterface } from "fastify/types/route"

export type RouteHandler = RouteHandlerMethod<Server, IncomingMessage, ServerResponse, RouteGenericInterface, unknown>
