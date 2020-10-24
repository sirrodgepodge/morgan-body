import t from "tap"

import { FastifyDriver } from "../../src/drivers/FastifyDriver"

t.test("FastifyDriver", async t => {
  const fakeReq = {
    headers: {
      "x-important-header": "hello",
      "user-agent": "cool agent 1.0",
    },
    body: {
      hello: "world",
    },
    ip: "1.1.1.1",
    method: "GET",
    raw: {
      url: "/",
    },
    id: 1,
  }

  const fakeRes = {
    getHeaders: () => ({
      output: "cool",
    }),
  }

  const resBody = {
    body: "hello body",
  }

  const same = (expected: object, found: object) => {
    for (const key in expected) {
      if (!found.hasOwnProperty(key)) return false
    }

    return true
  }

  const driver = new FastifyDriver(fakeReq as any, fakeRes as any)

  t.assertNot(driver.responseBody())

  // this is what registerMiddleware function is doing
  driver.responseBody = () => resBody

  t.equal(driver.requestHeaders(), fakeReq.headers)

  t.equal(driver.userAgent(), fakeReq.headers["user-agent"])
  delete fakeReq.headers["user-agent"]
  driver.req = fakeReq as any
  t.equal(driver.userAgent(), "unknown")

  t.equal(driver.requestBody(), fakeReq.body)
  t.equal(driver.ip(), fakeReq.ip)
  t.equal(driver.method(), fakeReq.method)
  t.equal(driver.path(), fakeReq.raw.url)
  t.assert(
    same(fakeRes.getHeaders(), driver.responseHeaders()),
    "should be equal"
  )
  t.equal(driver.responseBody(), resBody)
  t.equal(driver.id(), fakeReq.id)
  t.equal(driver.request(), fakeReq)
  t.equal(driver.response(), fakeRes)

  t.end()
})
