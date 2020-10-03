/**
 * Morgan Body
 * HTTP Logging library
 *
 * @author Roger Beaman
 * @license MIT
 */

/**
 * Main Class
 */
import MorganBody from "./MorganBody"

/**
 * Interfaces
 */
import ITransport from "./interfaces/ITransport"
import IDriver from "./interfaces/IDriver"

/**
 * Drivers
 */
import ExpressDriver from "./drivers/ExpressDriver"
import FastifyDriver from "./drivers/FastifyDriver"

/**
 * Transports
 */
import ConsoleTransport from "./transports/ConsoleTransport"
import FileTransport from "./transports/FileTransport"
import StreamTransport from "./transports/StreamTransport"

/**
 * Enums
 */
import EColor from "./enums/EColor"
import ETheme from "./enums/ETheme"

/**
 * Utils
 */
import ThemeUtils from "./utils/ThemeUtils"

/**
 * Types
 */
import {
  DateTimeFormatType,
  FilterFunctionType,
  StreamLikeType,
  ThemeType,
  Themes,
  MiddlewareFunc,
  MorganBodyOptions,
  MorganConstructorOptions,
  MorganConstructorTransport,
} from "./types/MiscTypes"

export default MorganBody

export {
  MorganBody,
  ITransport,
  IDriver,
  ConsoleTransport,
  FileTransport,
  StreamTransport,
  ExpressDriver,
  FastifyDriver,
  EColor,
  ETheme,
  ThemeUtils,
  DateTimeFormatType,
  FilterFunctionType,
  StreamLikeType,
  ThemeType,
  MorganBodyOptions,
  Themes,
  MiddlewareFunc,
  MorganConstructorOptions,
  MorganConstructorTransport,
}
