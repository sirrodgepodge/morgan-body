/**
 * Pad number to 2 digits.
 * @param num Number to pad
 */
export const pad2 = (num: number) => {
  const str = String(num)

  return (str.length === 1 ? "0" : "") + str
}

/**
 * Pad number to 3 digits.
 * @param num Number to pad
 */
export const pad3 = (num: number) => {
  const str = String(num)

  return (str.length === 1 ? "00" : str.length === 2 ? "0" : "") + str
}
