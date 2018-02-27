# morgan-body

Logging the way you always wanted it to be! <br />
Nicely colorized logging that includes Request and Response bodies.

[![NPM][nodei-image]][nodei-url]

## Example Use
*Note: unlike typical express middleware you must pass the actual app into the function*
```js
import morganBody from 'morgan-body';
import express from 'express';
import bodyParser from 'body-parser';

const app = express();

// must parse body before morganBody as body will be logged
app.use(bodyParser.json());

// hook morganBody to express app
morganBody(app);
```
<img width="657" alt="screen shot 2017-07-07 at 2 02 55 am" src="https://user-images.githubusercontent.com/7177292/27944997-74491fa6-62b8-11e7-96c8-82dbf2e6b50c.png">
*Note: console output is colorized for iTerm2, might look odd on terminals with other background colors

## API
### morganBody(\<express instance>, \<options object>)
  Options are:
  ```
  {
    noColors: (default: false), gets rid of colors in logs, while they're awesome, they don't look so good in log files as @rserentill pointed out

    maxBodyLength: (default: 1000), caps the length of the console output of a single request/response to specified length,

    logReqDateTime: (default: true), setting to false disables logging request date + time,

    dateTimeFormat: (default: 'utc', available: ['edt', clf', 'iso', 'utc']), lets you specify dateTime format logged if "logDateTime" option is true (otherwise dateTime not logged anyways)

    timezone: (default : server's local timezone), time will be logged in the specified timezone. e.g. "EST", "America/Los_Angeles", "Asia/Kolkata" (for Indian Standard Time), etc. Internally uses "momentjs" for interpreting the timezone, and if specified value is not understood by momentjs, falls back to using the local timezone. (Please have a look at the TZ column here for a lit of supported timezone strings: https://wikipedia.org/wiki/List_of_tz_database_time_zones#List).

    logReqUserAgent: (default: true), setting to false disables logging request user agent,

    logRequestBody: (default: true), setting to false disables logging request body,

    logResponseBody: (default: true), setting to false disables logging response body,

    skip: (default: null), optionally provide function of the signature "(req, res) => <bool>" to conditionally skip logging of requests (if provided function returns true),

    stream: (default: null), optionally provide a stream (or any object of the shape { write: <Function> }) to be used instead of "process.stdout" for logging to
  }
  ```

[nodei-image]: https://nodei.co/npm/morgan-body.png?downloads=true&downloadRank=true&stars=true
[nodei-url]: https://www.npmjs.com/package/morgan-body
