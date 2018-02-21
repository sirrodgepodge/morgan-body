// accepts array of functions
module.exports = function stdOutTest(...arr) {
  const arrLength = arr.length;
  let callCount = 0;

  return new Promise((resolve, reject) => {
    try {
      stdOutListen(function cb(line) {
        try {
          arr[callCount](line);
        } catch(e) {
          removeStdOutListeners();
          console.log({ callCount });
          return reject(e);
        }
        if (callCount === arrLength - 1) {
          removeStdOutListeners();
          resolve();
        } else {
          callCount++;
        }
      });
    } catch(e) {
      removeStdOutListeners();
      console.log({ callCount });
      reject(e);
    }
  })
}

var origWrite = process.stdout.write;
function stdOutListen(callback) {
  process.stdout.write = (function(writeToConsole) {
    return function(string, encoding, fd) {
      writeToConsole.apply(process.stdout, arguments)
      callback(string, encoding, fd)
    }
  })(process.stdout.write);
}

function removeStdOutListeners() {
  process.stdout.write = origWrite;
}
