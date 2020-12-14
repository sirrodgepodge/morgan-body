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

Please make sure to call morganBody before registering routers (but after registering body-parser), because otherwise they wouldn't be logged.

<img width="657" alt="screen shot 2017-07-07 at 2 02 55 am" src="https://user-images.githubusercontent.com/7177292/27944997-74491fa6-62b8-11e7-96c8-82dbf2e6b50c.png">
*Note: console output is colorized for iTerm2, might look odd on terminals with other background colors, which can be solved by themes!

## More Usages

### Log to file

In order to do that, you just need to pass a stream into the `stream` property in options. Example:
```js
const log = fs.createWriteStream(
  path.join(__dirname, "logs", "express.log"), { flags: "a" }
);

morganBody(app, {
  // .. other settings
  noColors: true,
  stream: log,
});
```

If your log files look like this:

<img width="796" src="https://user-images.githubusercontent.com/53915302/90952129-712da980-e461-11ea-90d6-8223acb2e07a.png">

You just need disable the colors with the `noColors` property in options.

### Multiple instances of MorganBody

If you want to use morganBody to log on multiple places, it can be done by just calling the function multiple times. As shown in the previous example,
you can log to write streams. But what if you want to log to console as well? Easy.
```js
// ... express

const log = fs.createWriteStream(
  path.join(__dirname, "logs", "express.log"), { flags: "a" }
);

morganBody(app, {
  // .. other settings
});

morganBody(app, {
  // .. other settings
  noColors: true,
  stream: log,
});
```

### Using different loggers

What if you use a different logging library to log all your important information about what's happening with your application?
You can use MorganBody with it as well!

Example with winston:
```js
import winston from 'winston'

// ... express

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      format: format.combine(format.timestamp(), loggerFormat),
      filename: path.join(__dirname, "../", "logs", "combined.log"),
    }),
  ],
});

const loggerStream = {
  write: message => {
    logger.info(message);
  },
};

morganBody(app, {
  // .. other settings
  stream: loggerStream
});

```

### Execute code X on write 

As you could've seen in the winston example, we don't even have a WriteStream here! 
You can just create an object with a write function inside it,and do whatever you want inside it!
```js
const loggerStream = {
  write: message => {
    // do anything - emit to websocket? send message somewhere? log to cloud?
  },
};

morganBody(app, {
  // .. other settings
  stream: loggerStream
});
```


## API
### morganBody(\<express instance>, \<options object>)
  Options are:
  ```
  {
    noColors: (default: false), gets rid of colors in logs, while they're awesome, they don't look so good in log files as @rserentill pointed out

    maxBodyLength: (default: 1000), caps the length of the console output of a single request/response to specified length,

    prettify: (default: true), prettifies the JSON request/response body (may want to turn off for server logs),

    includeNewLine: (default: true), adds new line after each log entry (a common use case for making this `false` is if `prettify` is false).

    logReqDateTime: (default: true), setting to false disables logging request date + time,

    dateTimeFormat: (default: 'utc', available: ['edt', clf', 'iso', 'utc']), lets you specify dateTime format logged if "logDateTime" option is true (otherwise dateTime not logged anyways)

    timezone: (default : server's local timezone), time will be logged in the specified timezone. e.g. "EST", "America/Los_Angeles", "Asia/Kolkata" (for Indian Standard Time), etc. Internally uses "momentjs" for interpreting the timezone, and if specified value is not understood by momentjs, falls back to using the local timezone. (Please have a look at the TZ column here for a lit of supported timezone strings: https://wikipedia.org/wiki/List_of_tz_database_time_zones#List).

    logReqUserAgent: (default: true), setting to false disables logging request user agent,

    logRequestBody: (default: true), setting to false disables logging request body,

    logReqHeaderList: (default: false), takes in a list of request headers to be displayed in the log.

    logAllReqHeader: (default: false), true will log All request headers and take precedence over logReqHeaderList; false otherwise.

    logResponseBody: (default: true), setting to false disables logging response body,

    logRequestId: (default: false), setting to true will log "req.id" at the beginning of each line (must be setting req.id elsewhere upstream),

    logIP: (default: true), setting to true will log request IP,

    logResHeaderList: (default: false), takes in a list of response headers to be displayed in the log.

    logAllResHeader: (default: false), true will log All response headers and take precedence over logResHeaderList; false otherwise.

    skip: (default: null), optionally provide function of the signature "(req, res) => <bool>" to conditionally skip logging of requests (if provided function returns true),

    stream: (default: null), optionally provide a stream (or any object of the shape { write: <Function> }) to be used instead of "process.stdout" for logging to,

    theme: (default: 'defaultTheme'), alter the color scheme of your logger with a theme, see available themes below

    filterParameters: (default: []), set the properties you don't want to be shown, such as passwords or credit card numbers

    immediateReqLog: (default: true), logs request immediately (instead of waiting until response goes out)
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
