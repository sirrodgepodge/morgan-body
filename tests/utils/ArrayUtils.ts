import t from "tap"

import * as ArrayUtils from "../../src/utils/ArrayUtils"

t.test("ArrayUtils", async t => {
  t.test("onlyKeepKeys()", async t => {
    const obj = {
      item1: "is here",
      item2: "is also here",
      item3: "may be here but will be deleted",
    }

    const found = ArrayUtils.onlyKeepKeys(obj, ["item1", "item2"])

    const expected = {
      item1: "is here",
      item2: "is also here",
    }

    /**
     * JS for some reason doesn't acknowledge them the same
     * for some reason.
     */
    const compare = () => {
      for (const key in found) {
        if (!expected.hasOwnProperty(key)) return false
      }
      return true
    }

    t.assert(compare(), "unspecified keys got removed")
  })

  t.test("getClosestInList()", async t => {
    const arr = [2, 3, 4, 9]

    // TODO: write test for getClosestInList()
  })

  t.test("shallowClone()", async t => {
    const obj = {
      testItem: "hello",
      testItem2: "world",
    }

    const found = ArrayUtils.shallowClone(obj)

    const same = () => {
      for (const key in obj) {
        if (!found.hasOwnProperty(key)) return false
      }

      return true
    }

    t.assert(same(), "cloned object is the same")
  })

  t.end()
})
