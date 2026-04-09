import type { ZmanId } from "./zmanim";
import type { Location } from "./location";
import type { DayInfo } from "./holidays";

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

export interface ApiError {
  code: string;
  message: string;
}

export interface ZmanTimeResult {
  zmanId: ZmanId;
  opinionId: string;
  time: string | null;
}

export interface ZmanimResponse {
  location: Location;
  date: string;
  dayInfo: DayInfo;
  zmanim: ZmanTimeResult[];
}

export interface GeocodeResponse {
  results: Location[];
}

export interface HebDateResponse {
  dayInfo: DayInfo;
}
