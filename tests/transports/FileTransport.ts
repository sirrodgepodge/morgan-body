import fs from "fs"
import t from "tap"

t.test("FileTransport", async t => {
  const testFileName = "file_transport--temp.log"
  const transport = await import("../../src/transports/FileTransport")

  // Transport must have a default export
  t.assert(transport.hasOwnProperty("default"), "has a valid default export")

  // Making sure the file is accessible
  fs.openSync(testFileName, "w+")

  // Instantiating the transport
  const defaultExport = new transport.default(testFileName)

  // Must contain a write function
  t.assert(
    typeof defaultExport.write === "function",
    "transport.write is a function"
  )

  /**
   * Functionality test
   */
  let expected = ""

  // Overriding the stream function, as we only need
  // to test if FileTransport passes this information to the stream
  const oldWrite = defaultExport.stream.write
  defaultExport.stream.write = (message: any) => {
    oldWrite.call(defaultExport.stream, message)
    expected = message
    return true
  }

  defaultExport.write("Write function test")

  t.equal(expected, "Write function test")

  t.end()
})
