const fs = require("fs");
const StreamTransport = require("./StreamTransport");

class FileTransport extends StreamTransport {
  constructor(file) {
    super(fs.createWriteStream(file, { flags: "a" }));
  }
}

module.exports = FileTransport;
