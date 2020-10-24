import chalk from "chalk"

export default (
  obj: Record<string, any>,
  enableColors = true,
  minify = false
) => {
  const json = minify ? JSON.stringify(obj, null) : JSON.stringify(obj, null, 2)

  if (!enableColors) return json

  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null|undefined)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    match => {
      let type = "unknown"

      if (/^"/.test(match)) type = /:$/.test(match) ? "key" : "string"
      else if (/true|false/.test(match)) type = "boolean"
      else if (/null|undefined/.test(match)) type = "null"

      return formatMatch(match, type)
    }
  )
}

const formatMatch = (match: string, type: string) => {
  switch (type) {
    case "number":
      return chalk.yellow(match)
    case "string":
      return chalk.green(match)
    case "boolean":
      return chalk.blue(match)
    case "key":
      match = match.replace(/['"]+/g, "")
      match = match.replace(":", chalk.whiteBright(":"))
      return chalk.bold.blueBright(match)
    case "unknown":
      return chalk.gray(match)
    case "null":
    default:
      return chalk.red(match)
  }
}
