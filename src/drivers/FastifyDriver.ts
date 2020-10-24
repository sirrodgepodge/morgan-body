import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify"
import IDriver from "../interfaces/IDriver"
import { MiddlewareFunc } from "../types/MiscTypes"

export class FastifyDriver implements IDriver {
  req: FastifyRequest
  reply: FastifyReply

  constructor(request: FastifyRequest, reply: FastifyReply) {
    this.req = request
    this.reply = reply
  }

  requestHeaders = () => this.req.headers
  responseHeaders = () => this.reply.getHeaders()

  requestBody = () => this.req.body
  responseBody = () => null

  userAgent = () => this.req.headers["user-agent"] || "unknown"
  ip = () => this.req.ip

  method = () => this.req.method

  path = () => this.req.raw.url

  id = () => this.req.id

  request = () => this.req

  response = () => this.reply
}

const registerMiddleware: MiddlewareFunc = (app: FastifyInstance, trigger) => {
  app.addHook("onSend", (req, reply, payload: string, next) => {
    const driver = new FastifyDriver(req, reply)
    driver.responseBody = () => JSON.parse(payload)
    trigger(driver)

    next()
  })
}

export default registerMiddleware
