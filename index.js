'use strict';

// For formatting date in appropriate timezone;
const moment = require('moment-timezone');

morgan.format = format;
morgan.token = token;

// this character resets current logging color to default
const unsetColor = '\x1b[0m';

// text colors
const black = '\x1b[30m';
const red = '\x1b[31m';
const green = '\x1b[32m';
const yellow = '\x1b[33m';
const blue = '\x1b[34m';
const purple = '\x1b[35m';
const cyan = '\x1b[36m';
const white = '\x1b[37m';

// intense colors
const intenseBlack = '\x1b[90m';
const intenseRed = '\x1b[91m';
const intenseGreen = '\x1b[92m';
const intenseYellow = '\x1b[93m';
const intenseBlue = '\x1b[94m';
const intensePurple = '\x1b[95m';
const intenseCyan = '\x1b[96m';
const intenseWhite = '\x1b[97m';

// creating this in function to avoid holding unnecessary variables in-memory
function getThemeObj(themeName) {
  themeName = themeName || 'defaultTheme';

  const themes = {};

  themes.defaultTheme = {
    actionColor: intenseCyan,
    methodColor: intenseYellow,
    pathColor: intenseWhite,
    dateColor: white,
    userAgentColor: intenseBlack,
    bodyActionColor: intensePurple,
    bodyColor: intenseWhite,
    responseTimeColor: white,
    defaultColor: unsetColor,
    status500: red,
    status400: yellow,
    status300: cyan,
    status200: green,
    status100: white,
  };

  // all colors are empty strings for 'noColorsTheme'
  themes.noColorsTheme = Object.keys(themes.defaultTheme).reduce((prev, curr) => {
    prev[curr] = '';
    return prev;
  }, {});

  // matches color digits in ansi string
  var colorDigitsMatcher = /\[(\d+)m/;;

  // convenience function for altering colors via algorithm
  var skewDefaults = func =>
    Object.keys(themes.defaultTheme).reduce((prev, curr) => {
      const currentThemeColor = themes.defaultTheme[curr];
      const [, ansiNumbers] = colorDigitsMatcher.exec(currentThemeColor);
      if (ansiNumbers.length === 1) { // don't want to mess with unsetString
        prev[curr] = currentThemeColor;
      } else {
        const [typeNumber, colorNumber] = ansiNumbers.split('');
        prev[curr] = `\x1b[${func({typeNumber: +typeNumber, colorNumber: +colorNumber})}m`;
      }
      return prev;
    }, {});

  // reverse all colors
  themes.inverted = skewDefaults(({ typeNumber, colorNumber }) => `${typeNumber}${7 - colorNumber}`);

  // no "intense colors"
  themes.dimmed = skewDefaults(({ colorNumber }) => `3${colorNumber}`);

  // darken all colors other than black by one
  themes.darkened = skewDefaults(({ typeNumber, colorNumber }) => `${typeNumber}${colorNumber > 0 ? colorNumber - 1 : 0}`);

  // lighten all colors other than white by one
  themes.lightened = skewDefaults(({ typeNumber, colorNumber }) => `${typeNumber}${colorNumber < 7 ? colorNumber + 1 : 7}`);

  function getClosestInList(list, startingVal) {
    const distanceObj = list.reduce((minDistanceObj, curr) => {
      const distance = Math.abs(curr - startingVal);
      return distance < minDistanceObj.distance ? { val: curr, distance: distance } : minDistanceObj
    }, { val: white , distance: Infinity});
    return distanceObj.val;
  }

  // round to either red, white, or black, all intense
  themes.dracula = skewDefaults(({ colorNumber }) => {
    const black = 0;
    const red = 1;
    const white = 7;

    const closestVal = getClosestInList([black, red, white], colorNumber);

    return `${closestVal === red ? 3 : 9}${closestVal}`
  });

  // round to either red, white, or black, all intense
  themes.usa = skewDefaults(({ colorNumber }) => {
    const red = 1;
    const blue = 4;
    const white = 7;

    const selectedVal = colorNumber === 6 ? red : getClosestInList([red, blue, white], colorNumber);

    return `${selectedVal === red ? 3 : 9}${selectedVal}`
  });

  return themes[themeName];
}

// allow for multiple loggers in app
let morganBodyUseCounter = 0;

function shallowClone(obj) {
  var newObj = {};
  Object.keys(obj).forEach(function keyLoop(key) {
    newObj[key] = obj[key];
  });
  return newObj;
}

function bodyToString(maxBodyLength, prettify, prependStr, body, bodyActionColor, bodyColor, defaultColor) {
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
    finalStr += bodyActionColor + prependStr + ' Body:' + defaultColor + '\n';

    if (body.length > maxBodyLength) body = body.slice(0, maxBodyLength) + '\n...';
    finalStr += bodyColor + body.slice(0, maxBodyLength) + defaultColor;
  } else if(isObj && Object.keys(body).length > 0) {
    finalStr += bodyActionColor + prependStr + ' Body:' + defaultColor;

    var jsonSeparator = prettify === true ? '\t' : null;
    var stringifiedObj = JSON.stringify(body, null, jsonSeparator);
    if (stringifiedObj.length > maxBodyLength) stringifiedObj = stringifiedObj.slice(0, maxBodyLength) + '\n...';

    var lineSeparator = prettify === true ? '\n' : '';
    stringifiedObj
      .split('\n') // split + loop needed for multi-line coloring
      .forEach(function logEachBodyLine(line) { finalStr += lineSeparator + bodyColor + line + defaultColor; });
  }
  return finalStr || null; // must return "null" to avoid morgan logging blank line
}

module.exports = function morganBody(app, options) {
  // default options
  options = options || {};
  var maxBodyLength = options.hasOwnProperty('maxBodyLength') ? options.maxBodyLength : 1000;
  var logReqDateTime = options.hasOwnProperty('logReqDateTime') ? options.logReqDateTime : true;
  var logAllReqHeader = options.hasOwnProperty('logAllReqHeader') ? options.logAllReqHeader : false;
  var logAllResHeader = options.hasOwnProperty('logAllResHeader') ? options.logAllResHeader : false;
  var logReqHeaderList = options.hasOwnProperty('logReqHeaderList') ? options.logReqHeaderList : null;
  var logResHeaderList = options.hasOwnProperty('logResHeaderList') ? options.logResHeaderList : null;
  var logReqUserAgent = options.hasOwnProperty('logReqUserAgent') ? options.logReqUserAgent : true;
  var logRequestBody = options.hasOwnProperty('logRequestBody') ? options.logRequestBody : true;
  var logResponseBody = options.hasOwnProperty('logResponseBody') ? options.logResponseBody : true;
  var timezone = options.hasOwnProperty('timezone') ? options.timezone || 'local' : 'local';
  var noColors = options.hasOwnProperty('noColors') ? options.noColors : false;
  var prettify = options.hasOwnProperty('prettify') ? options.prettify : true;

  var theme;
  if (noColors) {
    if (options.hasOwnProperty('theme')) {
      console.log(`\n\nWARNING: provided theme when 'noColor' option was set to true, theme provided: ${theme}, theme will be ignored\n\n`);
    }
    theme = 'noColorsTheme';
  } else {
    theme = options.hasOwnProperty('theme') ? options.theme : 'defaultTheme';
  }

  var themeObj = getThemeObj(theme);
  if (!themeObj) {
    console.log(`\n\nWARNING: provided theme does not match existing themes, value passed was: ${theme}, falling back to default theme\n\n`);
    themeObj = getThemeObj('defaultTheme');
  }
  var defaultColor = themeObj.defaultColor;
  var actionColor = themeObj.actionColor;
  var methodColor = themeObj.methodColor;
  var pathColor = themeObj.pathColor;
  var dateColor = themeObj.dateColor;
  var userAgentColor = themeObj.userAgentColor;
  var bodyActionColor = themeObj.bodyActionColor;
  var bodyColor = themeObj.bodyColor;
  var responseTimeColor = themeObj.responseTimeColor;
  var status500 = themeObj.status500;
  var status400 = themeObj.status400;
  var status300 = themeObj.status300;
  var status200 = themeObj.status200;
  var status100 = themeObj.status100;

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
  morganOptions.prettify = prettify; // needs to be passed to modify output stream separator


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
      var formatString = actionColor + '[:id] ' + 'Request: ' + methodColor + ':method ' + pathColor + ':url';
      if (logAllReqHeader) {
        formatString += ' headers[:request-headers]';
      } else {
        if (logReqHeaderList && logReqHeaderList.length > 0) {
          formatString += ' headers[';
          for (var i = 0; i < logReqHeaderList.length; i++) {
            formatString += `${logReqHeaderList[i]}=:req[${logReqHeaderList[i]}];`;
          }
          formatString += ']';
        }
      }
      if (logReqDateTime) formatString += ' ' + userAgentColor + 'at ' + dateColor + ':date';
      if (dateTimeFormat) formatString += `[${dateTimeFormat}]`;
      if (logReqDateTime && logReqUserAgent) formatString += ',';
      if (logReqUserAgent) formatString += ' ' + userAgentColor + 'User Agent: :user-agent' + defaultColor;
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
        const exPrependStr = '[' + getIDToken(req) + '] ' + prependStr;
        return bodyToString(maxBodyLength, prettify, exPrependStr, getBodyFunc(req, res), bodyActionColor, bodyColor, defaultColor);
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
    var statusColor = theme === 'noColorsTheme' ? defaultColor
      : status >= 500 ? status500
      : status >= 400 ? status400
      : status >= 300 ? status300
      : status >= 200 ? status200
      : status >= 100 ? status100
      : defaultColor;

    // get cached status-colored function
    var fn = developmentFormatLine[statusColor];

    if (!fn) {
      // compile
      var formatString = actionColor + '[:id] ' + 'Response:' + ' ' + statusColor + ':status ' + responseTimeColor + ':response-time ms ';
      if (logAllResHeader) {
        formatString += ' headers[:response-headers]' + defaultColor;
      } else {
        if (logResHeaderList && logResHeaderList.length > 0) {
          formatString += ' headers[';
          for (var i = 0; i < logResHeaderList.length; i++) {
            formatString += `${logResHeaderList[i]}=:res[${logResHeaderList[i]}];`;
          }
          formatString += ']' + defaultColor;
        }
      }

      fn = developmentFormatLine[statusColor] = compile(formatString);
    }

    return fn(tokens, req, res);
  });

  app.use(morgan(morganResFormatName, morganOptions));
}

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

function morgan(format, opts) {
  var fmt = format;
  opts = opts || {};

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

    var lineSeparator = opts.prettify === true ? '\n' : '';
    function logRequest() {
      if (skip !== false && skip(req, res)) {
        return;
      }

      var line = formatLine(morgan, req, res);

      if (line == null) { // truthy if line is null or undefined
        return;
      }

      stream.write(line + lineSeparator);
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

function getIDToken(req) {
  return req.id;
};

morgan.token('id', function getToken(req) {
  return getIDToken(req);
});

morgan.token('method', function getMethodToken(req) {
  return req.method;
});

function formattedHeaderStringify(headersObj) {
  return Object.keys(headersObj).reduce((accum, key) => {
    const value = headersObj[key];
    return `${accum}${accum.length === 0 ? "" : ";"}${key}=${value}`;
  }, "");
}

morgan.token('request-headers', function getRequestHeadersToken(req) {
  return formattedHeaderStringify(req.headers);
});

morgan.token('response-headers', function getResponseHeadersToken(req, res) {
  return formattedHeaderStringify(res.getHeaders());
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
