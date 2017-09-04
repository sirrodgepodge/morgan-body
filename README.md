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
    maxBodyLength: (default: 1000), caps the length of the console output of a single request/response to specified length,

    logDateTime: (default: true), allows disabling of logging request date + time,

    logReqUserAgent: (default: true), allows disabling of logging request user agent,

    logRequestBody: (default: true), allows disabling of logging request body,

    logResponseBody: (default: true), allows disabling of logging response body
  }
  ```

[nodei-image]: https://nodei.co/npm/morgan-body.png?downloads=true&downloadRank=true&stars=true
[nodei-url]: https://www.npmjs.com/package/morgan-body
