import { Application, Request, Response } from "express"
import { FastifyInstance } from "fastify"
import { Writable } from "stream"
import { IDriver, ITransport } from ".."
import IMorganBodyOptions from "../interfaces/IMorganOptions"
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
  settings: IMorganBodyOptions
  transports: ITransport[]
}

export {
  DateTimeFormatType,
  FilterFunctionType,
  StreamLikeType,
  ThemeType,
  Themes,
  MorganConstructorOptions,
  TriggerFunction,
  MiddlewareFunc,
}
