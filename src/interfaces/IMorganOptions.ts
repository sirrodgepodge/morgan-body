import { DateTimeFormatType, FilterFunctionType, StreamLikeType, ThemeType } from "../types/MiscTypes";

export default interface IMorganBodyOptions {
    noColors?: boolean;
    maxBodyLength?: number;
    prettify?: boolean;
    logReqDateTime?: boolean;
    dateTimeFormat?: DateTimeFormatType;
    timezone?: string;
    logReqUserAgent?: boolean;
    logRequestBody?: boolean;
    logReqHeaderList?: boolean;
    logAllReqHeader?: boolean;
    logResponseBody?: boolean;
    logRequestId?: boolean;
    logResHeaderList?: boolean;
    logAllResHeader?: boolean;
    logIP?: boolean,
    skip?: FilterFunctionType | null;
    stream?: StreamLikeType | null;
    theme?: ThemeType;
    filterParameters?: string[];
  }
