# morgan-body

## Example Use
*Note: unlike typical express middleware you must pass the actual app into the function*
```js
import logger from 'morgan-body';
import express from 'express';
import bodyParser from 'body-parser';

const app = express();

// must parse body before logger as body will be logged
app.use(bodyParser.json());

// hook logger to express app
logger(app);
```

### Sample Request+Body+Response Logging
*Note: Actual console output is nicely colorized for iTerm2 :)*
```
  Request: POST /login/ at Fri, 15 Jul 2016 03:13:48 GMT, User Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36
  Body:
  {
  	"email": "rwcbeaman@gmail.com",
  	"password": "blahB3"
  }
  Response: 200 136.940 ms - -
```
