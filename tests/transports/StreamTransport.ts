import { EventEmitter } from "events"
import t from "tap"
import { ITransport } from "../../src"

class FakeStream extends EventEmitter implements ITransport {
  write(message) {
    this.emit("write", message)
    return true
  }
}

t.test("StreamTransport", async t => {
  const transport = await import("../../src/transports/StreamTransport")

  // Transport must have a default export
  t.assert(transport.hasOwnProperty("default"), "has a valid default export")

  const fakeStream = new FakeStream()

  // Instantiating the transport
  const defaultExport = new transport.default(fakeStream)

  // Must contain a write function
  t.assert(
    typeof defaultExport.write === "function",
    "transport.write is a function"
  )

  /**
   * Functionality test
   */

  // String
  fakeStream.once("write", m => t.equal(m, "Write function test"))
  defaultExport.write("Write function test")

  // Object
  fakeStream.once("write", m => t.equal(m, JSON.stringify({ hello: "world" })))
  defaultExport.write({ hello: "world" })

  t.end()
})
