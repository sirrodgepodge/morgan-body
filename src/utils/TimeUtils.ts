import { pad2 } from "./NumberUtils"

export const toClfDate = (d: Date) => {
  const CLF_MONTH = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ]
  const date = d.getUTCDate()
  const hour = d.getUTCHours()
  const mins = d.getUTCMinutes()
  const secs = d.getUTCSeconds()
  const year = d.getUTCFullYear()

  const month = CLF_MONTH[d.getUTCMonth()]

  return (
    pad2(date) +
    "/" +
    month +
    "/" +
    year +
    ":" +
    pad2(hour) +
    ":" +
    pad2(mins) +
    ":" +
    pad2(secs) +
    " +0000"
  )
}
