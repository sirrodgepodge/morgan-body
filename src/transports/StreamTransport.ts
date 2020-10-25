import ITransport from "../interfaces/ITransport"
import { StreamLikeType } from "../types/MiscTypes"

/**
 * Logger for writing into a WriteStream
 */
export default class StreamTransport implements ITransport {
  stream: StreamLikeType

  constructor(stream: StreamLikeType) {
    this.stream = stream
  }

  write(message: any) {
    if (typeof message === "object") message = JSON.stringify(message)

    this.stream.write(message)
  }
}
