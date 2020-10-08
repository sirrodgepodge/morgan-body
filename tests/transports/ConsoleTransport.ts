import t from "tap"

t.test("ConsoleTransport", async t => {
  const transport = await import("../../src/transports/ConsoleTransport")

  // Transport must have a default export
  t.assert(transport.hasOwnProperty("default"), "has a valid default export")

  // Instantiating the transport
  const defaultExport = new transport.default()

  // Must contain a write function
  t.assert(
    typeof defaultExport.write === "function",
    "transport.write is a function"
  )

  /**
   * Functionality test
   */

  t.matchSnapshot(
    defaultExport.write("Write function test"),
    "Write function test"
  )

  t.end()
})
