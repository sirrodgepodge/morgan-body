import { WriteStream } from "fs";
import ITransport from "../interfaces/ITransport";

/**
 * Logger for writing into a WriteStream
 */
export default class StreamTransport implements ITransport {
  stream: WriteStream;

  constructor(stream: WriteStream) {
    this.stream = stream;
  }

  write(message: string) {
    this.stream.write(message);
  }
}
