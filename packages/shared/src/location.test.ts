import { describe, it, expect } from "vitest";
import { DEFAULT_LOCATIONS } from "./location";
import type { Location } from "./location";

describe("Location type", () => {
  it("can construct a location with elevation", () => {
    const loc: Location = {
      lat: 31.7683,
      lng: 35.2137,
      elevation: 800,
      name: "Jerusalem",
      timeZone: "Asia/Jerusalem",
    };
    expect(loc.elevation).toBe(800);
  });

  it("can construct a location without elevation", () => {
    const loc: Location = {
      lat: 40.7128,
      lng: -74.006,
      name: "New York",
      timeZone: "America/New_York",
    };
    expect(loc.elevation).toBeUndefined();
  });
});

describe("DEFAULT_LOCATIONS", () => {
  it("has exactly 4 default locations", () => {
    expect(Object.keys(DEFAULT_LOCATIONS)).toHaveLength(4);
  });

  it("includes jerusalem, newYork, losAngeles, london", () => {
    expect(DEFAULT_LOCATIONS.jerusalem).toBeDefined();
    expect(DEFAULT_LOCATIONS.newYork).toBeDefined();
    expect(DEFAULT_LOCATIONS.losAngeles).toBeDefined();
    expect(DEFAULT_LOCATIONS.london).toBeDefined();
  });

  it("jerusalem has elevation", () => {
    expect(DEFAULT_LOCATIONS.jerusalem.elevation).toBe(800);
  });

  it("all locations have valid lat/lng ranges", () => {
    for (const [key, loc] of Object.entries(DEFAULT_LOCATIONS)) {
      expect(loc.lat, `${key} lat out of range`).toBeGreaterThanOrEqual(-90);
      expect(loc.lat, `${key} lat out of range`).toBeLessThanOrEqual(90);
      expect(loc.lng, `${key} lng out of range`).toBeGreaterThanOrEqual(-180);
      expect(loc.lng, `${key} lng out of range`).toBeLessThanOrEqual(180);
    }
  });

  it("all locations have a non-empty timeZone", () => {
    for (const [key, loc] of Object.entries(DEFAULT_LOCATIONS)) {
      expect(loc.timeZone, `${key} missing timeZone`).toBeTruthy();
    }
  });
});
