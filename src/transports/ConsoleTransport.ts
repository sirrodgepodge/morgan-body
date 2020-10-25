/* eslint-disable no-console */
import ITransport from "../interfaces/ITransport"

/**
 * ConsoleTransport
 * Transport for logging into console
 */
class ConsoleTransport implements ITransport {
  write(message: any) {
    console.log(message)
  }
}

export default ConsoleTransport
