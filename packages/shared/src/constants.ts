export const DEFAULTS = {
  candleLightingMinutes: 18,
  language: "en",
  use24Hour: false,
  showSeconds: false,
} as const;

export const GEOCODE_CACHE_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

export const API_ERROR_CODES = {
  invalidLocation: "INVALID_LOCATION",
  invalidDate: "INVALID_DATE",
  computationFailed: "COMPUTATION_FAILED",
  geocodeFailed: "GEOCODE_FAILED",
  notFound: "NOT_FOUND",
} as const;
