# morgan-body

So frequently in Dexter and the "morgan" library, we are left wondering, where's the body?

Well, we've found it! <br> <i>(for "morgan" library, not the show :P)</i>

Here is logging the way you always wanted it to be! <br />
Nicely colorized logging that includes Request and Response bodies. 

(Now with Typescript support thanks to [@francisbrito](https://github.com/francisbrito))

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

    prettify: (default: true), prettifies the JSON request/response body (may want to turn off for server logs),

    logReqDateTime: (default: true), setting to false disables logging request date + time,

    dateTimeFormat: (default: 'utc', available: ['edt', clf', 'iso', 'utc']), lets you specify dateTime format logged if "logDateTime" option is true (otherwise dateTime not logged anyways)

    timezone: (default : server's local timezone), time will be logged in the specified timezone. e.g. "EST", "America/Los_Angeles", "Asia/Kolkata" (for Indian Standard Time), etc. Internally uses "momentjs" for interpreting the timezone, and if specified value is not understood by momentjs, falls back to using the local timezone. (Please have a look at the TZ column here for a lit of supported timezone strings: https://wikipedia.org/wiki/List_of_tz_database_time_zones#List).

    logReqUserAgent: (default: true), setting to false disables logging request user agent,

    logRequestBody: (default: true), setting to false disables logging request body,

    logResponseBody: (default: true), setting to false disables logging response body,

    skip: (default: null), optionally provide function of the signature "(req, res) => <bool>" to conditionally skip logging of requests (if provided function returns true),

    stream: (default: null), optionally provide a stream (or any object of the shape { write: <Function> }) to be used instead of "process.stdout" for logging to,

    theme: (default: 'defaultTheme'), alter the color scheme of your logger with a theme, see available themes below
  }
  ```

  ### Available Themes
  Can be passed in as "theme" option, screenshots taken in iTerm2 (note that some text is not visible in some screenshots, this is because this text is colored non-intense black, it would show up on white-background terminals).

  #### defaultTheme
  <img width="798" alt="screen shot 2018-06-30 at 11 40 31 pm" src="https://user-images.githubusercontent.com/7177292/42130919-b84ebdea-7cc1-11e8-806d-a8b648bfec7c.png">

  #### dracula
  <img width="793" alt="screen shot 2018-06-30 at 11 37 32 pm" src="https://user-images.githubusercontent.com/7177292/42130920-bc468c8e-7cc1-11e8-9c9d-be8707e665da.png">

  #### usa
  <img width="793" alt="screen shot 2018-06-30 at 11 14 48 pm" src="https://user-images.githubusercontent.com/7177292/42130923-ccc26ede-7cc1-11e8-9437-8ffff36afa5e.png">

  #### inverted
  reverse ASCII color of default
  <img width="796" alt="screen shot 2018-07-01 at 12 03 57 am" src="https://user-images.githubusercontent.com/7177292/42130934-4d278bc2-7cc2-11e8-9fac-4705f15e6207.png">

  #### darkened
  no white (all colors rotated one away from white)
  <img width="793" alt="screen shot 2018-06-30 at 11 24 42 pm" src="https://user-images.githubusercontent.com/7177292/42130921-c1cc82d0-7cc1-11e8-9cb3-62f18e46ff22.png">

  #### lightened
  no black (all colors rotated one away from black)
  <img width="791" alt="screen shot 2018-07-01 at 12 06 48 am" src="https://user-images.githubusercontent.com/7177292/42130947-b690439c-7cc2-11e8-819a-52ae4aa11db6.png">

  #### dimmed
  only non-"intense" colors
  <img width="786" alt="screen shot 2018-07-01 at 12 05 35 am" src="https://user-images.githubusercontent.com/7177292/42130941-8b01874a-7cc2-11e8-9f48-e1bb1ff4e039.png">

[nodei-image]: https://nodei.co/npm/morgan-body.png?downloads=true&downloadRank=true&stars=true
[nodei-url]: https://www.npmjs.com/package/morgan-body
