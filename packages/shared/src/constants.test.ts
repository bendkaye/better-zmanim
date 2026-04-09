import { describe, it, expect } from "vitest";
import {
  DEFAULTS,
  GEOCODE_CACHE_TTL_SECONDS,
  API_ERROR_CODES,
} from "./constants";

describe("DEFAULTS", () => {
  it("candle lighting is 18 minutes", () => {
    expect(DEFAULTS.candleLightingMinutes).toBe(18);
  });

  it("language defaults to en", () => {
    expect(DEFAULTS.language).toBe("en");
  });

  it("24-hour mode is off by default", () => {
    expect(DEFAULTS.use24Hour).toBe(false);
  });

  it("seconds are hidden by default", () => {
    expect(DEFAULTS.showSeconds).toBe(false);
  });
});

describe("GEOCODE_CACHE_TTL_SECONDS", () => {
  it("is 30 days in seconds", () => {
    expect(GEOCODE_CACHE_TTL_SECONDS).toBe(60 * 60 * 24 * 30);
  });
});

describe("API_ERROR_CODES", () => {
  it("has 5 error codes", () => {
    expect(Object.keys(API_ERROR_CODES)).toHaveLength(5);
  });

  it("all error codes are unique", () => {
    const values = Object.values(API_ERROR_CODES);
    expect(new Set(values).size).toBe(values.length);
  });

  it("error codes are SCREAMING_SNAKE_CASE", () => {
    for (const [key, value] of Object.entries(API_ERROR_CODES)) {
      expect(value, `${key} is not SCREAMING_SNAKE_CASE`).toMatch(
        /^[A-Z][A-Z_]+$/,
      );
    }
  });
});
