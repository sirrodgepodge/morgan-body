import { IDriver, ITransport } from "."
import { MorganConstructorOptions, MorganBodyOptions } from "./types/MiscTypes"

export default class MorganBody {
  transports: ITransport[]

  defaultOptions: MorganBodyOptions = {
    maxBodyLength: 1000,
    logReqDateTime: true,
    logAllReqHeader: false,
    logAllResHeader: false,
    logReqHeaderList: false,
    logResHeaderList: false,
    logReqUserAgent: true,
    logRequestBody: true,
    logResponseBody: true,
    logRequestId: false,
    logIP: true,
    timezone: "local",
    noColors: false,
    prettify: true,
    filterParameters: [],
  }
  options: MorganBodyOptions = this.defaultOptions

  constructor({ app, transports, options, driver }: MorganConstructorOptions) {
    this.transports = transports
    options && (this.options = this.configure(options))

    if (typeof driver !== "function")
      throw new Error(
        "The passed driver must be a function that registers the middleware."
      )

    driver(app, this.trigger.bind(this))
  }

  trigger(driver: IDriver) {
    // TODO: make the rest of the stuff
  }

  configure(newConfig: MorganBodyOptions) {
    for (const optionKey in this.defaultOptions) {
      if (!newConfig.hasOwnProperty(optionKey)) {
        newConfig[optionKey] = this.defaultOptions[optionKey]
      }
    }
    return newConfig
  }

  writeToTransports(message: string) {
    for (const transport of this.transports) {
      transport.write(message)
    }
  }

  toJsonSilent(string: string) {
    try {
      return JSON.parse(String(string))
    } catch (e) {
      return string
    }
  }
}
