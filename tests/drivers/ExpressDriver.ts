import t from "tap"

import { ExpressDriver } from "../../src/drivers/ExpressDriver"

t.test("ExpressDriver", async t => {
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
    url: "/",
  }

  const fakeRes = {
    getHeaders: () => ({
      output: "cool",
    }),
    _morganRes: {
      body: "hello body",
    },
  }

  const same = (expected: object, found: object) => {
    for (const key in expected) {
      if (!found.hasOwnProperty(key)) return false
    }

    return true
  }

  const driver = new ExpressDriver(fakeReq as any, fakeRes as any)

  t.equal(driver.requestHeaders(), fakeReq.headers)

  t.equal(driver.userAgent(), fakeReq.headers["user-agent"])
  delete fakeReq.headers["user-agent"]
  driver.req = fakeReq as any
  t.equal(driver.userAgent(), "unknown")

  t.equal(driver.requestBody(), fakeReq.body)
  t.equal(driver.ip(), fakeReq.ip)
  t.equal(driver.method(), fakeReq.method)
  t.equal(driver.path(), fakeReq.url)
  t.assert(
    same(fakeRes.getHeaders(), driver.responseHeaders()),
    "should be equal"
  )
  t.equal(driver.responseBody(), fakeRes._morganRes)
  t.equal(driver.id(), "Not implemented yet") // TODO: test once implemented

  t.end()
})
