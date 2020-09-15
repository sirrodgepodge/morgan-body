import StreamTransport from "./StreamTransport";
import fs from "fs";

/**
 * FileTransport
 * Transport for logging into a file
 */
export default class FileTransport extends StreamTransport {
  /**
   * FileTransport Constructor
   * @param file Filename to write in
   */
  constructor(file: string) {
    super(fs.createWriteStream(file, { flags: "a" }));
  }
}
