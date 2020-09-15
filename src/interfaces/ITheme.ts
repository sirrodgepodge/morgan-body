import EColor from "../enums/EColor";

export default interface ITheme {
  [key: string]: string;
  actionColor: EColor | string;
  methodColor: EColor | string;
  pathColor: EColor | string;
  dateColor: EColor | string;
  userAgentColor: EColor | string;
  bodyActionColor: EColor | string;
  bodyColor: EColor | string;
  responseTimeColor: EColor | string;
  defaultColor: EColor | string;
  status500: EColor | string;
  status400: EColor | string;
  status300: EColor | string;
  status200: EColor | string;
  status100: EColor | string;
}
