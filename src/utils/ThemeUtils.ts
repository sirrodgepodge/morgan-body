import EColor from "../enums/EColor"
import ITheme from "../interfaces/ITheme"
import { Themes } from "../types/MiscTypes"
import { getClosestInList } from "./ArrayUtils"

export type SkewDefaultsFunction = (settings: {
  typeNumber: number
  colorNumber: number
}) => string

/**
 * ThemeUtils
 * Class helping with all Theme-related things
 */
export default class ThemeUtils {
  defaultTheme: ITheme = {
    actionColor: EColor.INTENSE_CYAN,
    methodColor: EColor.INTENSE_YELLOW,
    pathColor: EColor.INTENSE_WHITE,
    dateColor: EColor.WHITE,
    userAgentColor: EColor.INTENSE_BLACK,
    bodyActionColor: EColor.INTENSE_PURPLE,
    bodyColor: EColor.INTENSE_WHITE,
    responseTimeColor: EColor.WHITE,
    defaultColor: EColor.UNSET,
    status500: EColor.RED,
    status400: EColor.YELLOW,
    status300: EColor.CYAN,
    status200: EColor.GREEN,
    status100: EColor.WHITE,
  }

  colorDigitsMatcher = /\[(\d+)m/

  skewDefaults = (func: SkewDefaultsFunction) => this.defaultTheme

  /**
   * Creates all themes
   * @returns {Themes} All themes
   */
  createThemes = () => {
    const themes: Themes = {
      defaultTheme: this.defaultTheme,
      noColorsTheme: (() => {
        const noColors = this.defaultTheme
        Object.keys(noColors).map(el => {
          noColors[el] = ""
          return el
        })
        return noColors
      })(),
      inverted: this.skewDefaults(
        ({ typeNumber, colorNumber }) => `${typeNumber}${7 - colorNumber}`
      ),
      dimmed: this.skewDefaults(({ colorNumber }) => `3${colorNumber}`),
      darkened: this.skewDefaults(
        ({ typeNumber, colorNumber }) =>
          `${typeNumber}${colorNumber > 0 ? colorNumber - 1 : 0}`
      ),
      lightened: this.skewDefaults(
        ({ typeNumber, colorNumber }) =>
          `${typeNumber}${colorNumber < 7 ? colorNumber + 1 : 7}`
      ),
      dracula: this.skewDefaults(({ colorNumber }) => {
        const black = 0
        const red = 1
        const white = 7

        const closestVal = getClosestInList([black, red, white], colorNumber)

        return `${closestVal === red ? 3 : 9}${closestVal}`
      }),
      usa: this.skewDefaults(({ colorNumber }) => {
        const red = 1
        const blue = 4
        const white = 7

        const selectedVal =
          colorNumber === 6
            ? red
            : getClosestInList([red, blue, white], colorNumber)

        return `${selectedVal === red ? 3 : 9}${selectedVal}`
      }),
    }
    return themes
  }
}
