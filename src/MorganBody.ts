import { IDriver, ITransport } from "."
import IMorganBodyOptions from "./interfaces/IMorganOptions"
import { MorganConstructorOptions } from "./types/MiscTypes"

export default class MorganBody {
  transports: ITransport[]

  defaultSettings: IMorganBodyOptions = {}
  settings: IMorganBodyOptions = this.defaultSettings

  constructor({ app, transports, settings, driver }: MorganConstructorOptions) {
    this.transports = transports
    settings && (this.settings = settings)

    if (typeof driver !== "function")
      throw new Error(
        "The passed driver must be a function that registers the middleware."
      )

    driver(app, this.trigger.bind(this))
  }

  trigger(driver: IDriver) {
    // TODO: make the rest of the stuff
    driver
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
