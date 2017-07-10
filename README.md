# morgan-body

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

### Sample Request+Body+Response Logging
*Note: Actual console output is nicely colorized for iTerm2 :)*
```
  Request: POST /login/ at Fri, 15 Jul 2016 03:13:48 GMT, User Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36
  Request Body:
  {
  	"email": "rwcbeaman@gmail.com",
  	"password": "blahB3"
  }
  Response Body:
  {
  	"user": {
      "email": "rwcbeaman@gmail.com",
    	"blogPosts": [
        "0": {
          heading: "title",
          content: "body"
        },
        "1": {
          heading: "title2",
          content: "body2"
        },
      ]
    }
  }
  Response: 200 136.940 ms - -
```
## API
### morganBody(<express instance>, <options object>)
  Options are:
  ```
  {
    maxBodyLength: (default: 1000), caps the length of the console output of a single request/response to specified length,

    logRequestBody: (default: true), allows disabling of logging request body,

    logResponseBody: (default: true), allows disabling of logging response body
  }
  ```

[nodei-image]: https://nodei.co/npm/morgan-body.png?downloads=true&downloadRank=true&stars=true
[nodei-url]: https://www.npmjs.com/package/morgan-body
