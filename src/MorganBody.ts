import { ThemeUtils } from "."
import IDriver from "./interfaces/IDriver"
import ConsoleTransport from "./transports/ConsoleTransport"
import {
  MorganConstructorOptions,
  MorganBodyOptions,
  MorganConstructorTransport,
  Themes,
} from "./types/MiscTypes"
import { onlyKeepKeys } from "./utils/ArrayUtils"

export default class MorganBody {
  transports: MorganConstructorTransport[]
  themes: Themes

  readonly defaultOptions: MorganBodyOptions = {
    maxBodyLength: 1000,
    logReqDateTime: true,
    logAllReqHeader: true,
    logAllResHeader: true,
    logReqHeaderList: [],
    logResHeaderList: [],
    logReqUserAgent: true,
    logRequestBody: true,
    logResponseBody: true,
    logRequestId: true,
    logIP: true,
    timezone: "local",
    noColors: true,
    prettify: true,
    filterParameters: [],
    theme: "defaultTheme",
  }
  options: MorganBodyOptions = this.defaultOptions

  constructor({ app, transports, driver }: MorganConstructorOptions) {
    this.transports = transports
    for (let i = 0; i < this.transports.length; i++) {
      transports[i].options = this.configure(transports[i].options)
    }

    if (typeof driver !== "function")
      throw new Error(
        "The passed driver must be a function that registers the middleware."
      )

    this.themes = new ThemeUtils().createThemes()

    driver(app, this.trigger.bind(this))
  }

  trigger(driver: IDriver) {
    // console.log("Logging with", driver.constructor.name)
    for (const { transport, options } of this.transports) {
      const {
        actionColor,
        methodColor,
        pathColor,
        dateColor,
        userAgentColor,
        defaultColor,
      } = this.themes[options.theme]

      let firstLine = `${
        options.logRequestId ? "Request Id:" + driver.id() + " - " : ""
      }${actionColor}Request: ${methodColor}${driver.method()} ${pathColor}${driver.path()}`

      if (options.logReqDateTime)
        firstLine +=
          " " + userAgentColor + "at " + dateColor + new Date().toUTCString()
      // TODO: if (options.dateTimeFormat) firstLine += `[${options.dateTimeFormat}]`
      if (options.logReqDateTime && options.logReqUserAgent) firstLine += ","
      if (options.logIP)
        firstLine += `${userAgentColor} IP: ${dateColor}${driver.ip()} ${defaultColor}`
      if (options.logReqUserAgent)
        firstLine += `${
          options.logIP ? ", " : ""
        }${userAgentColor}User Agent: ${driver.userAgent()} ${defaultColor}`

      transport.write(firstLine)

      if (options.logAllReqHeader) {
        // *logAllReqHeaders
        transport.write(`${actionColor}Request Headers: ${defaultColor}`)
        transport.write(driver.requestHeaders())
      } else {
        if (options.logReqHeaderList && options.logReqHeaderList.length > 0) {
          transport.write(`${actionColor}Request Headers: ${defaultColor}`)
          transport.write(
            onlyKeepKeys(driver.requestHeaders(), options.logReqHeaderList)
          )
        }
      }

      const reqBody = driver.requestBody()

      if (options.logRequestBody && reqBody) {
        transport.write(`${actionColor}Request Body: ${defaultColor}`)
        transport.write(reqBody)
      }

      if (options.logAllResHeader) {
        // *logAllReqHeaders
        transport.write(`${actionColor}Response Headers: ${defaultColor}`)
        transport.write(driver.responseHeaders())
      } else {
        if (options.logResHeaderList && options.logResHeaderList.length > 0) {
          transport.write(`${actionColor}Response Headers: ${defaultColor}}`)
          transport.write(
            onlyKeepKeys(driver.responseHeaders(), options.logResHeaderList)
          )
        }
      }

      const resBody = driver.responseBody()

      if (options.logRequestBody && resBody) {
        transport.write(`${actionColor}Response Body: ${defaultColor}`)
        transport.write(resBody)
      }
    }
  }

  /**
   * Make sure the configuration contains
   * all settings. Missing ones are replaced by default ones.
   *
   * @param newConfig New configuration object
   * @internal
   */
  private configure(newConfig: MorganBodyOptions) {
    if (typeof newConfig !== "object") return this.defaultOptions

    if (newConfig.theme && newConfig.noColors) {
      console.warn(
        "Warning: Passed a theme while set noColors to true. Ignoring theme."
      )
      delete newConfig["theme"]
    }

    for (const optionKey in this.defaultOptions) {
      if (!newConfig.hasOwnProperty(optionKey)) {
        if (optionKey === "theme" && newConfig.hasOwnProperty("noColors"))
          continue
        if (optionKey === "noColors" && newConfig.hasOwnProperty("theme"))
          continue
        newConfig[optionKey] = this.defaultOptions[optionKey]
      }
    }

    if (newConfig.noColors) {
      newConfig.theme = "noColorsTheme"
    }

    return newConfig
  }

  /**
   * Write message to transports
   *
   * @param message Message to write
   * @since 3.0.0-pre
   */
  writeToTransports(message: any) {
    for (const { transport } of this.transports) {
      transport.write(message)
    }
  }
}
