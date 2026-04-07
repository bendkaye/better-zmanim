export type ZmanimOpinion = "gra" | "mga" | "rabbeinuTam";

export interface ZmanimPreferences {
  opinion: ZmanimOpinion;
  candleLightingMinutes: number;
  showSeconds: boolean;
  use24Hour: boolean;
  elevation?: number;
}

export interface ZmanTime {
  name: string;
  hebrewName: string;
  time: string | null;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}
