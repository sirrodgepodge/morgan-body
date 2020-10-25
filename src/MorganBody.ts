import { ThemeUtils } from "."
import jsonFormatter from "./formatter/JsonFormatter"
import IDriver from "./interfaces/IDriver"
import {
  MorganConstructorOptions,
  MorganBodyOptions,
  MorganConstructorTransport,
  Themes,
  Timezone,
} from "./types/MiscTypes"
import { getActualKeys, onlyKeepKeys } from "./utils/ArrayUtils"
import { toClfDate } from "./utils/TimeUtils"

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
    timezone: "web",
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

  getTime(date: Date, timezone: Timezone) {
    switch (timezone) {
      case "clf":
        return toClfDate(date)
      case "iso":
        return date.toISOString()
      case "web":
      default:
        return date.toUTCString()
    }
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

      if (options.hasOwnProperty("skip")) {
        const skipped = options.skip(driver)

        // Continue instead of return, because like other options,
        // skip is a transport-specific option, return would however
        // result in skipping all transports.
        if (skipped) continue
      }

      let firstLine = `${
        options.logRequestId ? "Request Id:" + driver.id() + " - " : ""
      }${actionColor}Request: ${methodColor}${driver.method()} ${pathColor}${driver.path()}`

      if (options.logReqDateTime)
        firstLine +=
          " " +
          userAgentColor +
          "at " +
          dateColor +
          this.getTime(new Date(), options.timezone)
      // TODO: if (options.dateTimeFormat) firstLine += `[${options.dateTimeFormat}]`
      if (options.logReqDateTime && options.logReqUserAgent) firstLine += ","
      if (options.logIP)
        firstLine += `${userAgentColor} IP: ${dateColor}${driver.ip()} ${defaultColor}`
      if (options.logReqUserAgent)
        firstLine += `${
          options.logIP ? ", " : ""
        }${userAgentColor}User Agent: ${driver.userAgent()} ${defaultColor}`

      transport.write(firstLine)

      /**
       *
       * Request Headers
       *
       */
      const requestHeaders = driver.requestHeaders()
      if (
        requestHeaders &&
        (options.logAllReqHeader || options.logReqHeaderList instanceof Array)
      ) {
        if (options.logAllReqHeader) {
          transport.write(`${actionColor}Request Headers: ${defaultColor}`)
          transport.write(driver.requestHeaders())
        } else {
          if (options.logReqHeaderList && options.logReqHeaderList.length > 0) {
            transport.write(`${actionColor}Request Headers: ${defaultColor}`)
            transport.write(
              jsonFormatter(
                onlyKeepKeys(driver.requestHeaders(), options.logReqHeaderList),
                options.theme !== "noColorsTheme",
                !options.prettify
              )
            )
          }
        }
      }

      /**
       *
       * Request Body
       *
       */
      const requestBody = driver.requestBody() as Record<string, any>
      if (options.logRequestBody && requestBody) {
        transport.write(`${actionColor}Request Body: ${defaultColor}`)
        Object.keys(requestBody).map(key => {
          if (options.filterParameters.includes(requestBody[key]))
            requestBody[key] = "[FILTERED]"
          return key
        })
        transport.write(
          jsonFormatter(
            requestBody,
            options.theme !== "noColorsTheme",
            !options.prettify
          )
        )
      }

      /**
       *
       * Formatting Response Headers
       *
       */
      const responseHeaders = driver.responseHeaders()
      if (
        options.logAllResHeader &&
        getActualKeys(responseHeaders).length !== 0
      ) {
        transport.write(`${actionColor}Response Headers: ${defaultColor}`)
        transport.write(
          jsonFormatter(
            responseHeaders,
            options.theme !== "noColorsTheme",
            !options.prettify
          )
        )
      } else {
        if (options.logResHeaderList && options.logResHeaderList.length > 0) {
          const filteredHeaders = onlyKeepKeys(
            driver.responseHeaders(),
            options.logResHeaderList
          )
          if (getActualKeys(filteredHeaders).length >= 1) {
            transport.write(`${actionColor}Response Headers: ${defaultColor}}`)
            transport.write(jsonFormatter(filteredHeaders))
          }
        }
      }

      const responseBody = driver.responseBody() as Record<string, any>

      if (options.logRequestBody && responseBody) {
        transport.write(`${actionColor}Response Body: ${defaultColor}`)
        Object.keys(responseBody).map(key => {
          if (options.filterParameters.includes(responseBody[key]))
            responseBody[key] = "[FILTERED]"
          return key
        })
        transport.write(
          jsonFormatter(
            responseBody,
            options.theme !== "noColorsTheme",
            !options.prettify
          )
        )
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
