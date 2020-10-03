import { Application, Request, Response } from "express"
import IDriver from "../interfaces/IDriver"
import { MiddlewareFunc } from "../types/MiscTypes"

class ExpressDriver implements IDriver {
  req: Request
  res: Response

  constructor(req: Request, res: Response) {
    this.req = req
    this.res = res
  }

  requestHeaders = () => this.req.headers
  responseHeaders = () => this.res.getHeaders()

  requestBody = () => this.req.body
  responseBody = () => (this.res as any)._morganRes

  userAgent = () => this.req.headers["user-agent"] || "unknown"
  ip = () => this.req.ip

  method = () => this.req.method

  path = () => this.req.url

  id = () => "Not implemented yet" // TODO: Request Id
}

const registerMiddleware: MiddlewareFunc = (app: Application, trigger) => {
  app.use((req, res, next) => {
    const oldRes = res.send

    // @ts-ignore
    res.send = (data: unknown) => {
      // @ts-ignore
      res._morganRes = data

      oldRes.call(res, data)
      res.send = oldRes
      return oldRes
    }

    res.once("finish", () => trigger(new ExpressDriver(req, res)))

    next()
  })
}

export default registerMiddleware
