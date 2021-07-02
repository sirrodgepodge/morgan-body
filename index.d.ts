declare module "morgan-body" {
  import * as express from "express";
  import * as stream from "stream";

  type DateTimeFormatType = "edt" | "clf" | "iso" | "utc";
  type FilterFunctionType = (request: express.Request, response: express.Response) => boolean;
  type StreamLikeType = stream.Writable | { write: stream.Writable["write"] };
  type ThemeType = "defaultTheme" | "dracula" | "usa" | "inverted" | "darkened" | "lightened" | "dimmed";

  interface IMorganBodyOptions {
    noColors?: boolean;
    maxBodyLength?: number;
    prettify?: boolean;
    logReqDateTime?: boolean;
    dateTimeFormat?: DateTimeFormatType;
    timezone?: string;
    logReqUserAgent?: boolean;
    logRequestBody?: boolean;
    logReqHeaderList?: string[];
    logAllReqHeader?: boolean;
    logResponseBody?: boolean;
    logRequestId?: boolean;
    logResHeaderList?: boolean;
    logAllResHeader?: boolean;
    logIP?: boolean,
    includeNewLine?: boolean;
    includeFinalNewLine?: boolean;
    skip?: FilterFunctionType | null;
    stream?: StreamLikeType | null;
    theme?: ThemeType;
    filterParameters?: string[];
    immediateReqLog?: boolean;
  }

  export default function morganBody(app: express.Application, options?: IMorganBodyOptions): void;
}
