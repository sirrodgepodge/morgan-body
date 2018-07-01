require('./util/forceDateToZero'); // need to normalize dates for standardizing logs, overwrites Date, forcing all date times to zero

var assert = require('assert');
var consoleTest = require('universal-stream-test');
var simulateRequestPromise = require('./util/simulateRequestPromise');
var expect = require('chai').expect;

function standardRequestLineCheck(line) {
  expect(line).to.equal(`\u001b[96mRequest: \u001b[93mGET \u001b[97m/ \u001b[90mat \u001b[37mWed Dec 31 1969 19:00:00 GMT-0500, \u001b[90mUser Agent: node-superagent/3.8.2\u001b[0m\n`);
}

function standardPostRequestLineCheck(line) {
  expect(line).to.equal(`\u001b[96mRequest: \u001b[93mPOST \u001b[97m/ \u001b[90mat \u001b[37mWed Dec 31 1969 19:00:00 GMT-0500, \u001b[90mUser Agent: node-superagent/3.8.2\u001b[0m\n`);
}

function standardResponseLineCheck(line) {
  expect(forceResponseTimeToZero(line)).to.equal(`\u001b[96mResponse: \u001b[32m200 \u001b[37m0.000 ms - -\u001b[0m\n`);
}

function forceResponseTimeToZero(resStr) {
  var regex = /(.*)\d{1,2}\.\d{1,3}( ms .*)/;
  return resStr.replace(regex, '$10.000$2');
}


describe('morganBody()', function () {
  it('should log standard request and response correctly', function () {
    const consoleTestPromise = consoleTest(
      standardRequestLineCheck,
      standardResponseLineCheck
    );

    simulateRequestPromise(null, 'get');

    return consoleTestPromise;
  });

  it('should log request and response body correctly', function () {
    const sharedStr = `\u001b[97m{\u001b[0m
\u001b[97m\t"key": "value",\u001b[0m
\u001b[97m\t"key2": "value2"\u001b[0m
\u001b[97m}\u001b[0m
`;

    const consoleTestPromise = consoleTest(
      standardPostRequestLineCheck,
      line => expect(line).to.equal(`\u001b[95mRequest Body:\u001b[0m\n` + sharedStr),
      line => expect(line).to.equal(`\u001b[95mResponse Body:\u001b[0m\n` + sharedStr),
      standardResponseLineCheck
    );

    simulateRequestPromise(null, 'post', {
      key: 'value',
      key2: 'value2'
    }, {
      key: 'value',
      key2: 'value2'
    });

    return consoleTestPromise;
  });

  it('should log request and response body correctly without colors', function () {
    const sharedStr = `{
\t"key": "value",
\t"key2": "value2"
}
`;

    const consoleTestPromise = consoleTest(
      line => expect(line).to.equal('Request: POST / at Wed Dec 31 1969 19:00:00 GMT-0500, User Agent: node-superagent/3.8.2\n'),
      line => expect(line).to.equal(`Request Body:\n` + sharedStr),
      line => expect(line).to.equal(`Response Body:\n` + sharedStr),
      line => expect(forceResponseTimeToZero(line)).to.equal(`Response: 200 0.000 ms - -\n`)
    );

    simulateRequestPromise({ noColors: true }, 'post', { key: 'value', key2: 'value2' }, { key: 'value', key2: 'value2' });

    return consoleTestPromise;
  });

  it('should not prettify json object when "prettify" property is false', function() {
    var sharedStr = `{"key":"value","key2":"value2"}`;

    const consoleTestPromise = consoleTest(
      line => expect(line).to.equal('Request: POST / at Wed Dec 31 1969 19:00:00 GMT-0500, User Agent: node-superagent/3.8.2'),
      line => expect(line).to.equal(`Request Body:` + sharedStr),
      line => expect(line).to.equal(`Response Body:` + sharedStr),
      line => expect(forceResponseTimeToZero(line)).to.equal(`Response: 200 0.000 ms - -`)
    );

    simulateRequestPromise({ noColors: true, prettify: false }, 'post', { key: 'value', key2: 'value2' }, { key: 'value', key2: 'value2' });

    return consoleTestPromise;
  });

  it('should prettify json object when "prettify" property is true', function() {
    var sharedStr = `{
\t"key": "value",
\t"key2": "value2"
}
`;

    const consoleTestPromise = consoleTest(
      line => expect(line).to.equal('Request: POST / at Wed Dec 31 1969 19:00:00 GMT-0500, User Agent: node-superagent/3.8.2\n'),
      line => expect(line).to.equal(`Request Body:\n` + sharedStr),
      line => expect(line).to.equal(`Response Body:\n` + sharedStr),
      line => expect(forceResponseTimeToZero(line)).to.equal(`Response: 200 0.000 ms - -\n`)
    );

    simulateRequestPromise({ noColors: true, prettify: true }, 'post', { key: 'value', key2: 'value2' }, { key: 'value', key2: 'value2' });

    return consoleTestPromise;
  });


  it('should respect "maxBodyLength" property', function () {
    const consoleTestPromise = consoleTest(
      standardPostRequestLineCheck,
      line => expect(line).to.equal(`\u001b[95mRequest Body:\u001b[0m
\u001b[97m{\u001b[0m
\u001b[97m\t"key": "value",\u001b[0m
\u001b[97m\t"long": "aodshglkdgdlbgkz,bcmnxbvmcbgnsdlajkghdsalkjghxzlkgndajlkgㅓㅏ홍허ㅏ아ㅓ힝히ㅏㅓㅗㅇ마\u001b[0m
\u001b[97m...\u001b[0m
`));

    simulateRequestPromise({ maxBodyLength: 100 }, 'post', {
      key: 'value',
      long: 'aodshglkdgdlbgkz,bcmnxbvmcbgnsdlajkghdsalkjghxzlkgndajlkgㅓㅏ홍허ㅏ아ㅓ힝히ㅏㅓㅗㅇ마힝히머ㅓㅏㅣ론aksdjlgsjgklhdsgjksdahgakljsdgdskjlghdsajkladklsjghsdjkghslkjghdskjghdszgjkhda'
    });

    return consoleTestPromise;
  });

  it('should respect "logReqDateTime" property', function () {
    const consoleTestPromise = consoleTest(
      line => expect(line).to.equal(`\u001b[96mRequest: \u001b[93mGET \u001b[97m/ \u001b[90mUser Agent: node-superagent/3.8.2\u001b[0m\n`)
    );

    simulateRequestPromise({ logReqDateTime: false }, 'get');

    return consoleTestPromise;
  });

  it('should respect "logReqUserAgent" property', function () {
    const consoleTestPromise = consoleTest(
      line => expect(line).to.equal(`\u001b[96mRequest: \u001b[93mGET \u001b[97m/ \u001b[90mat \u001b[37mWed Dec 31 1969 19:00:00 GMT-0500\n`)
    );

    simulateRequestPromise({ logReqUserAgent: false }, 'get');

    return consoleTestPromise;
  });

  it('should respect "logRequestBody" property', function () {
    const consoleTestPromise = consoleTest(
      standardPostRequestLineCheck,
      standardResponseLineCheck
    );

    simulateRequestPromise({ logRequestBody: false }, 'post', { key: 'val' });

    return consoleTestPromise;
  });

  it('should respect "logResponseBody" property', function () {
    const consoleTestPromise = consoleTest(
      standardRequestLineCheck,
      standardResponseLineCheck
    );

    simulateRequestPromise({ logResponseBody: false }, 'get', null, { key: 'val' });

    return consoleTestPromise;
  });

  it('should handle "dateTimeFormat" of "iso"', function () {
    const consoleTestPromise = consoleTest(
      line => expect(line).to.equal(`\u001b[96mRequest: \u001b[93mGET \u001b[97m/ \u001b[90mat \u001b[37m1969-12-31T19:00:00.000-05:00, \u001b[90mUser Agent: node-superagent/3.8.2\u001b[0m\n`)
    );

    simulateRequestPromise({ dateTimeFormat: "iso" }, 'get');

    return consoleTestPromise;
  });

  it('should handle "dateTimeFormat" of "clf"', function () {
    const consoleTestPromise = consoleTest(
      line => expect(line).to.equal(`\u001b[96mRequest: \u001b[93mGET \u001b[97m/ \u001b[90mat \u001b[37m31/Dec/1969:19:00:00 -0500, \u001b[90mUser Agent: node-superagent/3.8.2\u001b[0m\n`)
    );

    simulateRequestPromise({ dateTimeFormat: "clf" }, 'get');

    return consoleTestPromise;
  });

  it('should handle "dateTimeFormat" of "utc"', function () {
    const consoleTestPromise = consoleTest(
      line => expect(line).to.equal(`\u001b[96mRequest: \u001b[93mGET \u001b[97m/ \u001b[90mat \u001b[37mThu, 01 Jan 1970 00:00:00 GMT, \u001b[90mUser Agent: node-superagent/3.8.2\u001b[0m\n`)
    );

    simulateRequestPromise({ dateTimeFormat: "utc" }, 'get');

    return consoleTestPromise;
  });

  it('should warn if "timezone" provided with "dateTimeFormat" of "utc"', function () {
    const consoleTestPromise = consoleTest(
      line => expect(line).to.equal(`\n\nWARNING: morgan-body was passed a value for "timezone" option with the "utc" "dateTimeFormat", UTC gets coerced to GMT as part of the standard ("timezone" passed was: Africa/Blantyre)\n\n\n`)
    );

    simulateRequestPromise({ dateTimeFormat: "utc", timezone: "Africa/Blantyre" }, 'get');

    return consoleTestPromise;
  });

  it('"timezone" property should update GMT adjustment val for default "dateTimeFormat"', function () {
    const consoleTestPromise = consoleTest(
      line => expect(line).to.equal(`\u001b[96mRequest: \u001b[93mGET \u001b[97m/ \u001b[90mat \u001b[37mThu Jan 01 1970 02:00:00 GMT+0200, \u001b[90mUser Agent: node-superagent/3.8.2\u001b[0m\n`)
    );

    simulateRequestPromise({ timezone: "Africa/Blantyre" }, 'get');

    return consoleTestPromise;
  });

  it('"timezone" property should update GMT adjustment val for "iso" "dateTimeFormat"', function () {
    const consoleTestPromise = consoleTest(
      line => expect(line).to.equal(`\u001b[96mRequest: \u001b[93mGET \u001b[97m/ \u001b[90mat \u001b[37m1970-01-01T02:00:00.000+02:00, \u001b[90mUser Agent: node-superagent/3.8.2\u001b[0m\n`)
    );

    simulateRequestPromise({ dateTimeFormat: 'iso', timezone: "Africa/Blantyre" }, 'get');

    return consoleTestPromise;
  });

  it('"timezone" property should update GMT adjustment val for "clf" "dateTimeFormat"', function () {
    const consoleTestPromise = consoleTest(
      line => expect(line).to.equal(`\u001b[96mRequest: \u001b[93mGET \u001b[97m/ \u001b[90mat \u001b[37m01/Jan/1970:02:00:00 +0200, \u001b[90mUser Agent: node-superagent/3.8.2\u001b[0m\n`)
    )

    simulateRequestPromise({ dateTimeFormat: 'clf', timezone: "Africa/Blantyre" }, 'get');

    return consoleTestPromise;
  });

  it('"skip" property should enable function to conditionally skip logging a line', function() {
    let message = 'was not called';
    consoleTest(() => {
      message = 'was called';
    });

    return simulateRequestPromise({ skip: () => true }, 'get').then(() => {
      expect(message).to.equal('was not called');
    });
  });

  it('"stream" property should enable writing somewhere other than stdout', function() {
    var arr = [];

    return simulateRequestPromise({ stream: { write: text => arr.push(text) } }, 'get').then(() => {
      const [reqStr, resStr] = arr;
      standardRequestLineCheck(reqStr);
      standardResponseLineCheck(resStr);
    });
  });

  describe('theme tests', () => {
    const getBodyStr = colorNumberStr => `\u001b[${colorNumberStr}m{\u001b[0m
\u001b[${colorNumberStr}m\t"key": "value",\u001b[0m
\u001b[${colorNumberStr}m\t"key2": "value2"\u001b[0m
\u001b[${colorNumberStr}m}\u001b[0m
`;

    const themedRequest = theme => simulateRequestPromise({theme}, 'post', {
      key: 'value',
      key2: 'value2'
    }, {
      key: 'value',
      key2: 'value2'
    });

    it('"inverted" theme should invert colors', function() {
      const bodyStr = getBodyStr(90);

      const consoleTestPromise = consoleTest(
        line => expect(line).to.equal(`\u001b[91mRequest: \u001b[94mPOST \u001b[90m/ \u001b[97mat \u001b[30mWed Dec 31 1969 19:00:00 GMT-0500, \u001b[97mUser Agent: node-superagent/3.8.2\u001b[0m\n`),
        line => expect(line).to.equal(`\u001b[92mRequest Body:\u001b[0m\n` + bodyStr),
        line => expect(line).to.equal(`\u001b[92mResponse Body:\u001b[0m\n` + bodyStr),
        line => expect(forceResponseTimeToZero(line)).to.equal(`\u001b[91mResponse: \u001b[35m200 \u001b[30m0.000 ms - -\u001b[0m\n`)
      );

      themedRequest('inverted');

      return consoleTestPromise;
    });

    it('"dimmed" theme should have no intense colors', function() {
      const bodyStr = getBodyStr(37);

      const consoleTestPromise = consoleTest(
        line => expect(line).to.equal(`\u001b[36mRequest: \u001b[33mPOST \u001b[37m/ \u001b[30mat \u001b[37mWed Dec 31 1969 19:00:00 GMT-0500, \u001b[30mUser Agent: node-superagent/3.8.2\u001b[0m\n`),
        line => expect(line).to.equal(`\u001b[35mRequest Body:\u001b[0m\n` + bodyStr),
        line => expect(line).to.equal(`\u001b[35mResponse Body:\u001b[0m\n` + bodyStr),
        line => expect(forceResponseTimeToZero(line)).to.equal(`\u001b[36mResponse: \u001b[32m200 \u001b[37m0.000 ms - -\u001b[0m\n`)
      );

      themedRequest('dimmed');

      return consoleTestPromise;
    });

    it('"darkened" theme should push all colors down by one unless black', function() {
      const bodyStr = getBodyStr(96);

      const consoleTestPromise = consoleTest(
        line => expect(line).to.equal(`\u001b[95mRequest: \u001b[92mPOST \u001b[96m/ \u001b[90mat \u001b[36mWed Dec 31 1969 19:00:00 GMT-0500, \u001b[90mUser Agent: node-superagent/3.8.2\u001b[0m\n`),
        line => expect(line).to.equal(`\u001b[94mRequest Body:\u001b[0m\n` + bodyStr),
        line => expect(line).to.equal(`\u001b[94mResponse Body:\u001b[0m\n` + bodyStr),
        line => expect(forceResponseTimeToZero(line)).to.equal(`\u001b[95mResponse: \u001b[31m200 \u001b[36m0.000 ms - -\u001b[0m\n`)
      );

      themedRequest('darkened');

      return consoleTestPromise;
    });

    it('"lightened" theme should push all colors up by one unless black', function() {
      const bodyStr = getBodyStr(97);

      const consoleTestPromise = consoleTest(
        line => expect(line).to.equal(`\u001b[97mRequest: \u001b[94mPOST \u001b[97m/ \u001b[91mat \u001b[37mWed Dec 31 1969 19:00:00 GMT-0500, \u001b[91mUser Agent: node-superagent/3.8.2\u001b[0m\n`),
        line => expect(line).to.equal(`\u001b[96mRequest Body:\u001b[0m\n` + bodyStr),
        line => expect(line).to.equal(`\u001b[96mResponse Body:\u001b[0m\n` + bodyStr),
        line => expect(forceResponseTimeToZero(line)).to.equal(`\u001b[97mResponse: \u001b[33m200 \u001b[37m0.000 ms - -\u001b[0m\n`)
      );

      themedRequest('lightened');

      return consoleTestPromise;
    });

    it('"dracula" theme should be dracula-ish', function() {
      const bodyStr = getBodyStr(97);

      const consoleTestPromise = consoleTest(
        line => expect(line).to.equal(`\u001b[97mRequest: \u001b[31mPOST \u001b[97m/ \u001b[90mat \u001b[97mWed Dec 31 1969 19:00:00 GMT-0500, \u001b[90mUser Agent: node-superagent/3.8.2\u001b[0m\n`),
        line => expect(line).to.equal(`\u001b[97mRequest Body:\u001b[0m\n` + bodyStr),
        line => expect(line).to.equal(`\u001b[97mResponse Body:\u001b[0m\n` + bodyStr),
        line => expect(forceResponseTimeToZero(line)).to.equal(`\u001b[97mResponse: \u001b[31m200 \u001b[97m0.000 ms - -\u001b[0m\n`)
      );

      themedRequest('dracula');

      return consoleTestPromise;
    });

    it('"usa" theme should be dracula-ish', function() {
      const bodyStr = getBodyStr(97);

      const consoleTestPromise = consoleTest(
        line => expect(line).to.equal(`\u001b[31mRequest: \u001b[94mPOST \u001b[97m/ \u001b[31mat \u001b[97mWed Dec 31 1969 19:00:00 GMT-0500, \u001b[31mUser Agent: node-superagent/3.8.2\u001b[0m\n`),
        line => expect(line).to.equal(`\u001b[94mRequest Body:\u001b[0m\n` + bodyStr),
        line => expect(line).to.equal(`\u001b[94mResponse Body:\u001b[0m\n` + bodyStr),
        line => expect(forceResponseTimeToZero(line)).to.equal(`\u001b[31mResponse: \u001b[31m200 \u001b[97m0.000 ms - -\u001b[0m\n`)
      );

      themedRequest('usa');

      return consoleTestPromise;
    });
  })
});
