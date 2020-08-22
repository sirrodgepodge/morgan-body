const BaseTransport = require("./BaseTransport");

class StreamTransport extends BaseTransport {

    stream;

    constructor(stream) {
        super()
        this.stream = stream
    }

    write(message) {
        this.stream.write(message)
    }

}

module.exports = StreamTransport
