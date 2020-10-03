import { Application, Request, Response } from "express"
import { FastifyInstance } from "fastify"
import { Writable } from "stream"
import { IDriver, ITransport } from ".."
import ITheme from "../interfaces/ITheme"

type DateTimeFormatType = "edt" | "clf" | "iso" | "utc"

type FilterFunctionType = (request: Request, response: Response) => boolean

type StreamLikeType = Writable | { write: Writable["write"] }

type ThemeType =
  | "noColorsTheme"
  | "defaultTheme"
  | "dracula"
  | "usa"
  | "inverted"
  | "darkened"
  | "lightened"
  | "dimmed"

type Themes = { [key in ThemeType]: ITheme }

type MorganBodyOptions = {
  [key: string]: any
  noColors?: boolean
  maxBodyLength?: number
  prettify?: boolean
  logReqDateTime?: boolean
  dateTimeFormat?: DateTimeFormatType
  timezone?: string
  logReqUserAgent?: boolean
  logRequestBody?: boolean
  logReqHeaderList?: string[]
  logAllReqHeader?: boolean
  logResponseBody?: boolean
  logRequestId?: boolean
  logResHeaderList?: string[]
  logAllResHeader?: boolean
  logIP?: boolean
  skip?: FilterFunctionType | null
  stream?: StreamLikeType | null
  theme?: ThemeType
  filterParameters?: string[]
}

type TriggerFunction = (driver: IDriver) => void

// This exists solely because in TS you cannot define static
// properties for interfaces
type MiddlewareFunc = (
  app: MorganConstructorOptions["app"],
  trigger: TriggerFunction
) => void

type MorganConstructorOptions = {
  app: Application | FastifyInstance | any
  driver: MiddlewareFunc
  transports: MorganConstructorTransport[]
}

type MorganConstructorTransport = {
  transport: ITransport
  options?: MorganBodyOptions
}

export {
  DateTimeFormatType,
  FilterFunctionType,
  StreamLikeType,
  ThemeType,
  Themes,
  MorganConstructorOptions,
  MorganBodyOptions,
  TriggerFunction,
  MiddlewareFunc,
  MorganConstructorTransport,
}
