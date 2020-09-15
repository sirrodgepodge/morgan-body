import { Request, Response } from "express";
import { Writable } from "stream";

type DateTimeFormatType = "edt" | "clf" | "iso" | "utc";

type FilterFunctionType = (request: Request, response: Response) => boolean;

type StreamLikeType = Writable | { write: Writable["write"] };

type ThemeType =
  | "defaultTheme"
  | "dracula"
  | "usa"
  | "inverted"
  | "darkened"
  | "lightened"
  | "dimmed";

export { DateTimeFormatType, FilterFunctionType, StreamLikeType, ThemeType };
