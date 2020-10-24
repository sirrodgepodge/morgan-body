export const getClosestInList = (list: number[], startingVal: number) => {
  const distanceObj = list.reduce(
    (minDistanceObj, curr) => {
      const distance = Math.abs(curr - startingVal)
      return distance < minDistanceObj.distance
        ? { val: curr, distance: distance }
        : minDistanceObj
    },
    { val: 7, distance: Infinity }
  )
  return distanceObj.val
}

/**
 * Shallow clone an object
 * @param obj Object to shallow clone
 */
export const shallowClone = (obj: Record<string, unknown>) => {
  const newObj: typeof obj = {}
  Object.keys(obj).forEach(key => {
    newObj[key] = obj[key]
  })
  return newObj
}

/**
 * Removes any other keys that are not
 * specified in param keys
 *
 * @param obj The object
 * @param keys Keys to keep
 */
export const onlyKeepKeys = <T extends object>(obj: T, keys: any[]): T => {
  for (const key in obj) {
    if (!keys.includes(key)) {
      delete obj[key]
    }
  }

  return obj
}

/**
 * Returns array with keys of an object,
 * filters out keys that have value of undefined
 *
 * @param obj Object to take keys from
 * @returns {Array} of Object's keys
 */
export const getActualKeys = (obj: object): string[] => {
  return Object.keys(obj).filter(el => obj[el] !== undefined)
}
