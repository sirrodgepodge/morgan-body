var http = require('http');
var request = require('supertest');
var bodyParser = require('body-parser');
var morganBody = require('../..');


module.exports = function simulateRequestPromise(opts, method = 'get', reqBody, resBody, addToRequestObj = {}) {
  return new Promise((resolve, reject) => {
    try {
      let req = request(createServer(opts, resBody, addToRequestObj));
      req = req[method]('/');
      if (reqBody) req = req.send(reqBody);
      req.expect(200, resolve);
    } catch(e) {
      reject(e);
    }
  });
}

function createServer(opts, responseObj, addToRequestObj) {
  var funcPipeline = [];
  var fakeApp = {
    use(func) {
      funcPipeline.push(func);
    },
    response: {
      send() {}
    }
  };

  return http.createServer(function onRequest (req, res) {
    // add properties to request object
    Object.keys(addToRequestObj).forEach(key => {
      req[key] = addToRequestObj[key];
    });

    morganBody(fakeApp, opts || {});

    res.send = fakeApp.response.send.bind(res);

    // run middleware consecutively with req and res, some mini-express action here
    var morganBodySequence = funcPipeline.reduceRight(function(prev, curr) {
      return function middlewareWrapper(scopedReq, scopedRes) {
        curr(scopedReq, scopedRes, prev.bind(null, scopedReq, scopedRes));
      };
    }, function finished(scopedReq, scopedRes) {
      if (responseObj) scopedRes.send(responseObj);
      scopedRes.end();
    }).bind(null, req, res);

    bodyParser.urlencoded({extended: true, limit: '50mb'})(req, res, () => {
      bodyParser.json()(req, res, morganBodySequence);
    });
  })
}
