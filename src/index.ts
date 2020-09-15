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
import MorganBody, { ConstructorTransport } from "./MorganBody";

/**
 * Interfaces
 */
import ITransport from "./interfaces/ITransport";

/**
 * Transports
 */
import ConsoleTransport from "./transports/ConsoleTransport";
import FileTransport from "./transports/FileTransport";
import StreamTransport from "./transports/StreamTransport";

/**
 * Enums
 */
import EColor from "./enums/EColor";
import ETheme from "./enums/ETheme";

/**
 * Utils
 */
import ThemeUtils from "./utils/ThemeUtils";

/**
 * Types
 */
import {
  DateTimeFormatType,
  FilterFunctionType,
  StreamLikeType,
  ThemeType,
} from "./types/MiscTypes";

export default MorganBody;

export {
  MorganBody,
  ConstructorTransport,
  ITransport,
  ConsoleTransport,
  FileTransport,
  StreamTransport,
  EColor,
  ETheme,
  ThemeUtils,
  DateTimeFormatType,
  FilterFunctionType,
  StreamLikeType,
  ThemeType,
};
