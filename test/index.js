require('./util/forceDateToZero'); // need to normalize dates for standardizing logs, overwrites Date, forcing all date times to zero

var assert = require('assert');
var stdOutTest = require('./util/stdOutTest');
var simulateRequestPromise = require('./util/simulateRequestPromise');
var expect = require('chai').expect;

function standardRequestLineCheck(line) {
  expect(line).to.equal(`\u001b[96mRequest: \u001b[93mGET \u001b[97m/ \u001b[90mat \u001b[37mWed Dec 31 1969 19:00:00 GMT-0500, \u001b[90mUser Agent: node-superagent/1.3.0\u001b[0m\n`);
}

function standardPostRequestLineCheck(line) {
  expect(line).to.equal(`\u001b[96mRequest: \u001b[93mPOST \u001b[97m/ \u001b[90mat \u001b[37mWed Dec 31 1969 19:00:00 GMT-0500, \u001b[90mUser Agent: node-superagent/1.3.0\u001b[0m\n`);
}

function standardResponseLineCheck(line) {
  expect(forceResponseTimeToZero(line)).to.equal(`\u001b[96mResponse: \u001b[32m200 \u001b[0m0.000 ms - -\u001b[0m\n`);
}

function forceResponseTimeToZero(resStr) {
  var regex = /(.*)\d{1,2}\.\d{1,3}( ms .*)/;
  return resStr.replace(regex, '$10.000$2');
}


describe('morganBody()', function () {
  it('should log standard request and response correctly', function (done) {
    stdOutTest(standardRequestLineCheck, standardResponseLineCheck).then(done).catch(done);

    simulateRequestPromise(null, 'get');
  });

  it('should log request and response body correctly', function (done) {
    const keyValFuncs = [function checkReqBody(line) {
      expect(line).to.equal(`\u001b[97m{\u001b[0m\n`)
    }, function checkReqBody(line) {
      expect(line).to.equal(`\u001b[97m\t"key": "value",\u001b[0m\n`)
    }, function checkReqBody(line) {
      expect(line).to.equal(`\u001b[97m\t"key2": "value2"\u001b[0m\n`)
    }, function checkReqBody(line) {
      expect(line).to.equal(`\u001b[97m}\u001b[0m\n`)
    }];

    stdOutTest(standardRequestLineCheck, function checkReqBody(line) {
      expect(line).to.equal(`\u001b[95mRequest Body:\u001b[0m\n`);
    }, ...keyValFuncs, function checkResBody(line) {
      expect(line).to.equal(`\u001b[95mResponse Body:\u001b[0m\n`);
    }, ...keyValFuncs, standardResponseLineCheck).then(done).catch(done);

    simulateRequestPromise(null, 'get', { key: 'value', key2: 'value2' }, { key: 'value', key2: 'value2' });
  });

  it('should respect "maxBodyLength" property', function (done) {
    stdOutTest(standardPostRequestLineCheck, function checkReqBody(line) {
      expect(line).to.equal(`\u001b[95mRequest Body:\u001b[0m\n`);
    }, function checkReqBody(line) {
      expect(line).to.equal(`\u001b[97m{\u001b[0m\n`)
    }, function checkReqBody(line) {
      expect(line).to.equal(`\u001b[97m\t"key": "value",\u001b[0m\n`)
    }, function checkReqBody(line) {
      expect(line).to.equal(`\u001b[97m\t"long": "aodshglkdgdlbgkz,bcmnxbvmcbgnsdlajkghdsalkjghxzlkgndajlkgㅓㅏ홍허ㅏ아ㅓ힝히ㅏㅓㅗㅇ마\u001b[0m\n`)
    }, function checkReqBody(line) {
      expect(line).to.equal(`\u001b[97m...\u001b[0m\n`)
    }).then(done).catch(done);

    simulateRequestPromise({ maxBodyLength: 100 }, 'post', {
      key: 'value',
      long: 'aodshglkdgdlbgkz,bcmnxbvmcbgnsdlajkghdsalkjghxzlkgndajlkgㅓㅏ홍허ㅏ아ㅓ힝히ㅏㅓㅗㅇ마힝히머ㅓㅏㅣ론aksdjlgsjgklhdsgjksdahgakljsdgdskjlghdsajkladklsjghsdjkghslkjghdskjghdszgjkhda'
    });
  });

  it('should respect "logReqDateTime" property', function (done) {
    stdOutTest(function checkReq(line) {
      expect(line).to.equal(`\u001b[96mRequest: \u001b[93mGET \u001b[97m/ \u001b[90mUser Agent: node-superagent/1.3.0\u001b[0m\n`);
    }).then(done).catch(done);

    simulateRequestPromise({ logReqDateTime: false }, 'get');
  });

  it('should respect "logReqUserAgent" property', function (done) {
    stdOutTest(function checkReq(line) {
      expect(line).to.equal(`\u001b[96mRequest: \u001b[93mGET \u001b[97m/ \u001b[90mat \u001b[37mWed Dec 31 1969 19:00:00 GMT-0500\n`);
    }).then(done).catch(done);

    simulateRequestPromise({ logReqUserAgent: false }, 'get');
  });

  it('should respect "logRequestBody" property', function (done) {
    stdOutTest(standardPostRequestLineCheck, standardResponseLineCheck).then(done).catch(done);

    simulateRequestPromise({ logRequestBody: false }, 'post', { key: 'val' });
  });

  it('should respect "logResponseBody" property', function (done) {
    stdOutTest(standardRequestLineCheck, standardResponseLineCheck).then(done).catch(done);

    simulateRequestPromise({ logResponseBody: false }, 'get', null, { key: 'val' });
  });

  it('should handle "dateTimeFormat" of "iso"', function (done) {
    stdOutTest(function checkReq(line) {
      expect(line).to.equal(`\u001b[96mRequest: \u001b[93mGET \u001b[97m/ \u001b[90mat \u001b[37m1969-12-31T19:00:00.000-05:00, \u001b[90mUser Agent: node-superagent/1.3.0\u001b[0m\n`)
    }).then(done).catch(done);

    simulateRequestPromise({ dateTimeFormat: "iso" }, 'get');
  });

  it('should handle "dateTimeFormat" of "clf"', function (done) {
    stdOutTest(function checkReq(line) {
      expect(line).to.equal(`\u001b[96mRequest: \u001b[93mGET \u001b[97m/ \u001b[90mat \u001b[37m31/Dec/1969:19:00:00 -0500, \u001b[90mUser Agent: node-superagent/1.3.0\u001b[0m\n`)
    }).then(done).catch(done);

    simulateRequestPromise({ dateTimeFormat: "clf" }, 'get');
  });

  it('should handle "dateTimeFormat" of "utc"', function (done) {
    stdOutTest(function checkReq(line) {
      expect(line).to.equal(`\u001b[96mRequest: \u001b[93mGET \u001b[97m/ \u001b[90mat \u001b[37mThu, 01 Jan 1970 00:00:00 GMT, \u001b[90mUser Agent: node-superagent/1.3.0\u001b[0m\n`)
    }).then(done).catch(done);

    simulateRequestPromise({ dateTimeFormat: "utc" }, 'get');
  });

  it('should warn if "timezone" provided with "dateTimeFormat" of "utc"', function (done) {
    stdOutTest(function checkReq(line) {
      expect(line).to.equal(`\n\nWARNING: morgan-body was passed a value for "timezone" option with the "utc" "dateTimeFormat", UTC gets coerced to GMT as part of the standard ("timezone" passed was: Africa/Blantyre)\n\n\n`)
    }).then(done).catch(done);

    simulateRequestPromise({ dateTimeFormat: "utc", timezone: "Africa/Blantyre" }, 'get');
  });

  it('"timezone" property should update GMT adjustment val for default "dateTimeFormat"', function (done) {
    stdOutTest(function checkReq(line) {
      expect(line).to.equal(`\u001b[96mRequest: \u001b[93mGET \u001b[97m/ \u001b[90mat \u001b[37mThu Jan 01 1970 02:00:00 GMT+0200, \u001b[90mUser Agent: node-superagent/1.3.0\u001b[0m\n`)
    }).then(done).catch(done);

    simulateRequestPromise({ timezone: "Africa/Blantyre" }, 'get');
  });

  it('"timezone" property should update GMT adjustment val for "iso" "dateTimeFormat"', function (done) {
    stdOutTest(function checkReq(line) {
      expect(line).to.equal(`\u001b[96mRequest: \u001b[93mGET \u001b[97m/ \u001b[90mat \u001b[37m1970-01-01T02:00:00.000+02:00, \u001b[90mUser Agent: node-superagent/1.3.0\u001b[0m\n`)
    }).then(done).catch(done);

    simulateRequestPromise({ dateTimeFormat: 'iso', timezone: "Africa/Blantyre" }, 'get');
  });

  it('"timezone" property should update GMT adjustment val for "clf" "dateTimeFormat"', function (done) {
    stdOutTest(function checkReq(line) {
      expect(line).to.equal(`\u001b[96mRequest: \u001b[93mGET \u001b[97m/ \u001b[90mat \u001b[37m01/Jan/1970:02:00:00 +0200, \u001b[90mUser Agent: node-superagent/1.3.0\u001b[0m\n`)
    }).then(done).catch(done);

    simulateRequestPromise({ dateTimeFormat: 'clf', timezone: "Africa/Blantyre" }, 'get');
  });

  it('"skip" property should enable function to conditionally skip logging a line', function(done) {
    let message = 'was not called';
    stdOutTest(() => {}).then(() => {
      message = 'was called';
    });

    simulateRequestPromise({ skip: () => true }, 'get');
    new Promise(resolve => setTimeout(resolve, 1)).then(() => {
      expect(message).to.equal('was not called');
    }).then(done).catch(done);
  });
});
