'use strict';

// For formatting date in appropriate timezone;
const moment = require('moment-timezone');

morgan.format = format;
morgan.token = token;

// allow for multiple loggers in app
let morganBodyUseCounter = 0;

function shallowClone(obj) {
  var newObj = {};
  Object.keys(obj).forEach(function keyLoop(key) {
    newObj[key] = obj[key];
  });
  return newObj;
}

const ansiRegex = /\x1b.*?[mGKH]/g;

function bodyToString(maxBodyLength, noColors, prependStr, body) {
  if (!body) {
    return null; // must return "null" to avoid morgan logging blank line
  }

  var finalStr = '';

  var bodyType = typeof body;
  var isObj = body !== null && bodyType === 'object';
  var isString = bodyType === 'string';

  if (isString) {
    try {
      body = JSON.parse(body);
      bodyType = typeof body;
      isObj = body !== null && bodyType === 'object';
      isString = bodyType === 'string';
    } catch(e) { }
  }

  if (body instanceof Buffer) {
    body = '<Buffer>';
    bodyType = 'string';
    isObj = false;
    isString = true;
  }

  if (!isObj && !isString && body !== undefined) {
    body = ""+body; // coerce to string if primitive
    isString = true;
  }

  if (isString && body.length) {
    finalStr += noColors ? prependStr + ' Body:' : '\x1b[95m' + prependStr + ' Body:\x1b[0m';

    if (body.length > maxBodyLength) body = body.slice(0, maxBodyLength) + '\n...';
    finalStr += noColors ? body.slice(0, maxBodyLength) : '\x1b[97m' + body.slice(0, maxBodyLength) + '\x1b[0m';
  } else if(isObj && Object.keys(body).length > 0) {
    finalStr += noColors ? prependStr + ' Body:' : '\x1b[95m' + prependStr + ' Body:\x1b[0m';

    var stringifiedObj = JSON.stringify(body, null, '\t');
    if (stringifiedObj.length > maxBodyLength) stringifiedObj = stringifiedObj.slice(0, maxBodyLength) + '\n...';
    stringifiedObj
      .split('\n') // split + loop needed for multi-line coloring
      .forEach(line => { finalStr += noColors ? '\n' + line : '\n\x1b[97m' + line + '\x1b[0m'; });
  }
  return finalStr || null; // must return "null" to avoid morgan logging blank line
}

module.exports = function morganBody(app, options) {
  // default options
  options = options || {};
  var maxBodyLength = options.hasOwnProperty('maxBodyLength') ? options.maxBodyLength : 1000;
  var logReqDateTime = options.hasOwnProperty('logReqDateTime') ? options.logReqDateTime : true;
  var logReqUserAgent = options.hasOwnProperty('logReqUserAgent') ? options.logReqUserAgent : true;
  var logRequestBody = options.hasOwnProperty('logRequestBody') ? options.logRequestBody : true;
  var logResponseBody = options.hasOwnProperty('logResponseBody') ? options.logResponseBody : true;
  var timezone = options.hasOwnProperty('timezone') ? options.timezone || 'local' : 'local';
  var noColors = options.hasOwnProperty('noColors') ? options.noColors : false;

  // handling of native morgan options
  var morganOptions = {};
  if (options.hasOwnProperty('buffer')) {
    throw new Error("morgan-body at present does not support morgan's \"buffer\" option, to do so the multiple underlying morgan formats this library uses would need to be combined into one, would love a PR for that! https://github.com/sirrodgepodge/morgan-body");
  }
  if (options.hasOwnProperty('immediate')) {
    console.log(`\n\nWARNING: morgan-body was passed a morganOptions object with an "immediate" property, value passed was: ${morganOptions.immediate}, this is ignored by morgan-body as its manipulation is required internally\n\n`);
  }
  if (options.hasOwnProperty('stream')) {
    morganOptions.stream = options.stream;
  }
  if (options.hasOwnProperty('skip')) {
    morganOptions.skip = options.skip;
  }


  if (logReqDateTime) {
    var dateTimeFormat = options.hasOwnProperty('dateTimeFormat') ? options.dateTimeFormat || '' : '';
    if (typeof dateTimeFormat !== 'string') throw new Error(`morgan-body was passed a non-string value for "dateTimeFormat" option, value passed was: ${dateTimeFormat}`);
    else {
      dateTimeFormat = dateTimeFormat.toLowerCase().trim();
      if (!['iso', 'clf', 'utc', ''].some(function(value) { return value === dateTimeFormat })) { // enum check
        throw new Error(`morgan-body was passed a value that was not one of 'iso', 'clf', or 'utc' for "dateTimeFormat" option, value passed was: ${options.dateTimeFormat}`);
      }

      // utc, iso, and CLF force GMT time, no point in providing timezone
      if (dateTimeFormat === 'utc' && options.timezone) {
        console.log(`\n\nWARNING: morgan-body was passed a value for "timezone" option with the "utc" "dateTimeFormat", UTC gets coerced to GMT as part of the standard ("timezone" passed was: ${timezone})\n\n`);
      } else {
        timezone = timezone.toLowerCase().trim();
        if (timezone === 'local') {
          timezone = moment.tz.guess();
        } else if (!moment.tz.zone(timezone)) {
          throw new Error(`morgan-body was passed a value for "timezone" option that was not a valid timezone (value passed was : ${timezone}. See here for valid timezone list see TZ column here: https://wikipedia.org/wiki/List_of_tz_database_time_zones#List`);
        }
        dateTimeFormat += `,${timezone}`;
      }
    }
  } else {
    if(options.dateTimeFormat) {
      console.log(`WARNING: option "dateTimeFormat" was provided to morgan-body even though option "logReqDateTime" was set to false, value passed was: ${options.dateTimeFormat}`)
    }
    if(options.timezone) {
      console.log(`WARNING: option "timezone" was provided to morgan-body even though option "logReqDateTime" was set to false, value passed was: ${options.timezone}`)
    }
  }

  // allow up to 100 loggers, likely way more than needed need to reset counter
  // at a cutoff to avoid memory leak for developing when app live reloads
  morganBodyUseCounter = (morganBodyUseCounter + 1) % 100;
  var morganReqFormatName = `dev-req-${morganBodyUseCounter}`;

  morgan.format(morganReqFormatName, function developmentFormatLine(tokens, req, res) {
    var fn = developmentFormatLine.func;
    if (!fn) {
      // compile and memoize
      var formatString = '\x1b[96mRequest: \x1b[93m:method \x1b[97m:url';
      if (logReqDateTime) formatString += ' \x1b[90mat \x1b[37m:date';
      if (dateTimeFormat) formatString += `[${dateTimeFormat}]`;
      if (logReqDateTime && logReqUserAgent) formatString += ',';
      if (logReqUserAgent) formatString += ' \x1b[90mUser Agent: :user-agent\x1b[0m';
      if (noColors) formatString = formatString.replace(ansiRegex, '');
      fn = developmentFormatLine.func = compile(formatString);
    }

    return fn(tokens, req, res);
  });

  // log when request comes in
  var reqMorganOptions = shallowClone(morganOptions);
  reqMorganOptions.immediate = true;
  app.use(morgan(morganReqFormatName, morganOptions));

  if (logRequestBody || logResponseBody) {
    function logBodyGen(prependStr, getBodyFunc) {
      var bodyFormatName = 'bodyFmt_' + prependStr + morganBodyUseCounter;
      morgan.format(bodyFormatName, function logBody(_, req, res) {
        return bodyToString(maxBodyLength, noColors, prependStr, getBodyFunc(req, res));
      });
      return bodyFormatName;
    }

    if (logRequestBody) {
      app.use(morgan(logBodyGen('Request', req => req.body), morganOptions));
    }

    if (logResponseBody) {
      // need to catch setting of response body
      var originalSend = app.response.send;
      app.response.send = function sendOverWrite(body) {
        originalSend.call(this, body);
        this.__morgan_body_response = body;
      };

      app.use(morgan(logBodyGen('Response', (req, res) => res.__morgan_body_response), morganOptions));
    }
  }

  var morganResFormatName = `dev-res-${morganBodyUseCounter}`;

  // log response metadata (modified morgan source to remove method and url, added colors)
  morgan.format(morganResFormatName, function developmentFormatLine(tokens, req, res) {
    // get the status code if response written
    var status = res._header
      ? res.statusCode
      : undefined;

    // get status color
    var color = status >= 500 ? 31 // red
      : status >= 400 ? 33 // yellow
      : status >= 300 ? 36 // cyan
      : status >= 200 ? 32 // green
      : 0; // no color

    // get colored function
    var fn = developmentFormatLine[color];

    if (!fn) {
      // compile
      var responseStr = '\x1b[96mResponse: \x1b['
        + color + 'm:status \x1b[0m:response-time ms - :res[content-length]\x1b[0m';
      if (noColors) responseStr = responseStr.replace(ansiRegex, '');
      fn = developmentFormatLine[color] = compile(responseStr);
    }

    return fn(tokens, req, res);
  });

  app.use(morgan(morganResFormatName, morganOptions));
};

// module.exports = morgan;
// module.exports.format = format;
// module.exports.token = token;

/**
 * Module dependencies.
 * @private
 */

var onFinished = require('on-finished');
var onHeaders = require('on-headers');

/**
 * Array of CLF month names.
 * @private
 */

var clfmonth = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/**
 * Default log buffer duration.
 * @private
 */

var defaultBufferDuration = 1000;

/**
 * Create a logger middleware.
 *
 * @public
 * @param {String|Function} format
 * @param {Object} [options]
 * @return {Function} middleware
 */

function morgan(format, options) {
  var fmt = format;
  var opts = options || {};

  // unnecessary since we only call this function internally
  // if (format && typeof format === 'object') {
  //   opts = format;
  //   fmt = opts.format || 'default';
  // }

  // output on request instead of response
  var immediate = opts.immediate;

  // check if log entry should be skipped
  var skip = opts.skip || false;

  // format function
  var formatLine = typeof fmt !== 'function'
    ? getFormatFunction(fmt)
    : fmt;

  // stream
  var buffer = opts.buffer;
  var stream = opts.stream || process.stdout;

  // buffering support
  if (buffer) {

    // flush interval
    var interval = typeof buffer !== 'number'
      ? defaultBufferDuration
      : buffer;

    // swap the stream
    stream = createBufferStream(stream, interval);
  }

  return function logger(req, res, next) {
    // request data
    req._startAt = undefined;
    req._startTime = undefined;
    req._remoteAddress = getip(req);

    // response data
    res._startAt = undefined;
    res._startTime = undefined;

    // record request start
    recordStartTime.call(req);

    function logRequest() {
      if (skip !== false && skip(req, res)) {
        return;
      }

      var line = formatLine(morgan, req, res);

      if (null == line) {
        return;
      }

      stream.write(line + '\n');
    }

    if (immediate) {
      // immediate log
      logRequest();
    } else {
      // record response start
      onHeaders(res, recordStartTime);

      // log when response finished
      onFinished(res, logRequest);
    }

    next();
  };
}

/**
 * request url
 */

morgan.token('url', function getUrlToken(req) {
  return req.originalUrl || req.url;
});

/**
 * request method
 */

morgan.token('method', function getMethodToken(req) {
  return req.method;
});

/**
 * response time in milliseconds
 */

morgan.token('response-time', function getResponseTimeToken(req, res, digits) {
  if (!req._startAt || !res._startAt) {
    // missing request and/or response start time
    return;
  }

  // calculate diff
  var ms = (res._startAt[0] - req._startAt[0]) * 1e3
    + (res._startAt[1] - req._startAt[1]) * 1e-6;

  // return truncated value
  return ms.toFixed(digits === undefined ? 3 : digits);
});

/**
 * current date
 */

function formatTimezone(date, timezone) {
  return moment(date).tz(timezone);
}

morgan.token('date', function getDateToken(req, res, format) {
  format = format.split(',');
  var dateFormat = format[0];
  var timezone = format[1];

  var date = new Date();

  switch (dateFormat) {
    case 'utc':
      return date.toUTCString();
    default:
      if (timezone) date = formatTimezone(date, timezone);
      switch (dateFormat) {
        case 'iso':
          return isoDate(date);
        case 'clf':
          return clfDate(date);
        default:
          return date.format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
      }
  }
});

/**
 * response status code
 */

morgan.token('status', function getStatusToken(req, res) {
  return res._header
    ? String(res.statusCode)
    : undefined;
});

/**
 * normalized referrer
 */

morgan.token('referrer', function getReferrerToken(req) {
  return req.headers.referer || req.headers.referrer;
});

/**
 * remote address
 */

morgan.token('remote-addr', getip);

/**
 * remote user
 */

/**
 * HTTP version
 */

morgan.token('http-version', function getHttpVersionToken(req) {
  return req.httpVersionMajor + '.' + req.httpVersionMinor;
});

/**
 * UA string
 */

morgan.token('user-agent', function getUserAgentToken(req) {
  return req.headers['user-agent'];
});

/**
 * request header
 */

morgan.token('req', function getRequestToken(req, res, field) {
  // get header
  var header = req.headers[field.toLowerCase()];

  return Array.isArray(header)
    ? header.join(', ')
    : header;
});

/**
 * response header
 */

morgan.token('res', function getResponseTime(req, res, field) {
  if (!res._header) return undefined;

  // get header
  var header = res.getHeader(field);

  return Array.isArray(header)
    ? header.join(', ')
    : header;
});

/**
  Format a date in ISO format, including UTC offset
*/

function isoDate(dateObj) {
  var current_date = pad2(dateObj.date()),
  	current_month = pad2(dateObj.month() + 1),
  	current_year = pad2(dateObj.year()),
  	current_hrs = pad2(dateObj.hours()),
  	current_mins = pad2(dateObj.minutes()),
  	current_secs = pad2(dateObj.seconds()),
    current_millisecs = pad3(dateObj.milliseconds()),
    timezoneOffset = dateObj.utcOffset();

  if (timezoneOffset === 0) {
    timezoneOffset = 'Z';
  } else {
    var	offset_hrs = pad2(parseInt(Math.abs(timezoneOffset/60))),
      offset_min = pad2(Math.abs(timezoneOffset%60)),
      sign = timezoneOffset > 0 ? '+' : '-';

    timezoneOffset = sign + offset_hrs + ':' + offset_min;
  }

  return current_year + '-' + current_month + '-' + current_date + 'T' + current_hrs + ':' + current_mins + ':' + current_secs + '.' + current_millisecs + timezoneOffset;
}

/**
 * Format a Date in the common log format.
 *
 * @private
 * @param {Date} dateObj
 * @return {string}
 */

function clfDate(dateObj) {
  var hoursOffset = dateObj.utcOffset() / 6;
  var absoluteHoursOffset = Math.abs(hoursOffset);
  var hoursOffsetSign = hoursOffset === absoluteHoursOffset ? '+' : '-'; // true === positive

  var date = dateObj.date();
  var hour = dateObj.hours();
  var mins = dateObj.minutes();
  var secs = dateObj.seconds();
  var year = dateObj.year();
  var month = clfmonth[dateObj.month()];

  return pad2(date) + '/' + month + '/' + year
    + ':' + pad2(hour) + ':' + pad2(mins) + ':' + pad2(secs)
    + ` ${hoursOffsetSign}${pad3(absoluteHoursOffset)}0`;
}

/**
 * Compile a format string into a function.
 *
 * @param {string} format
 * @return {function}
 * @public
 */

function compile(format) {
  if (typeof format !== 'string') {
    throw new TypeError('argument format must be a string');
  }

  var fmt = format.replace(/"/g, '\\"');
  var js = '  return "' + fmt.replace(/:([-\w]{2,})(?:\[([^\]]+)\])?/g, function(_, name, arg) {
    return '"\n    + (tokens["' + name + '"](req, res, ' + String(JSON.stringify(arg)) + ') || "-") + "';
  }) + '";';

  return new Function('tokens, req, res', js);
}

/**
 * Create a basic buffering stream.
 *
 * @param {object} stream
 * @param {number} interval
 * @public
 */

function createBufferStream(stream, interval) {
  var buf = [];
  var timer = null;

  // flush function
  function flush() {
    timer = null;
    stream.write(buf.join(''));
    buf.length = 0;
  }

  // write function
  function write(str) {
    if (timer === null) {
      timer = setTimeout(flush, interval);
    }

    buf.push(str);
  }

  // return a minimal "stream"
  return { write: write };
}

/**
 * Define a format with the given name.
 *
 * @param {string} name
 * @param {string|function} fmt
 * @public
 */

function format(name, fmt) {
  morgan[name] = fmt;
  return this;
}

/**
 * Lookup and compile a named format function.
 *
 * @param {string} name
 * @return {function}
 * @public
 */

function getFormatFunction(name) {
  // lookup format
  var fmt = morgan[name] || name || morgan.default;

  // return compiled format
  return typeof fmt !== 'function'
    ? compile(fmt)
    : fmt;
}

/**
 * Get request IP address.
 *
 * @private
 * @param {IncomingMessage} req
 * @return {string}
 */

function getip(req) {
  return req.ip
    || req._remoteAddress
    || (req.connection && req.connection.remoteAddress)
    || undefined;
}

/**
 * Pad number to two digits.
 *
 * @private
 * @param {number} num
 * @return {string}
 */

function pad2(num) {
  var str = String(num);

  return (str.length === 1 ? '0' : '')
    + str;
}

function pad3(num) {
  var str = String(num);

  return (str.length === 1 ? '00' : str.length === 2 ? '0' : '')
    + str;
}

/**
 * Record the start time.
 * @private
 */

function recordStartTime() {
  this._startAt = process.hrtime();
  this._startTime = new Date();
}

/**
 * Define a token function with the given name,
 * and callback fn(req, res).
 *
 * @param {string} name
 * @param {function} fn
 * @public
 */

function token(name, fn) {
  morgan[name] = fn;
  return this;
}
