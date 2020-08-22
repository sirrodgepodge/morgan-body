const BaseTransport = require("./BaseTransport");

class ConsoleTransport extends BaseTransport {

    constructor() {
        super()
    }

    write(message) {
        console.log(message)
    }

}

module.exports = ConsoleTransport
