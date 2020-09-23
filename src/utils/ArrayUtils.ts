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
