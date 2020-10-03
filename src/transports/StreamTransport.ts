import { WriteStream } from "fs"
import ITransport from "../interfaces/ITransport"

/**
 * Logger for writing into a WriteStream
 */
export default class StreamTransport implements ITransport {
  stream: WriteStream

  constructor(stream: WriteStream) {
    this.stream = stream
  }

  write(message: any) {
    if (typeof message === "object") message = JSON.stringify(message)

    this.stream.write(message)
  }
}
