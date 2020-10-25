import t from "tap"

import * as NumberUtils from "../../src/utils/NumberUtils"

t.test("NumberUtils", async t => {
  t.test("pad2()", async t => {
    const pad = NumberUtils.pad2(1)
    t.assert(pad.toString(), "01")

    const anotherPad = NumberUtils.pad2(11)
    t.assert(anotherPad.toString(), "011")
  })

  t.test("pad3()", async t => {
    const pad = NumberUtils.pad3(1)
    t.assert(pad.toString(), "001")

    const anotherPad = NumberUtils.pad3(11)
    t.assert(anotherPad.toString(), "011")
  })

  t.end()
})
