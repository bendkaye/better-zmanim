import { describe, it, expect } from "vitest";
import {
  DEFAULT_PREFERENCES,
  buildDefaultVisibleOpinions,
  buildDefaultPrimaryOpinions,
} from "./opinions";
import { ZMANIM } from "./zmanim";
import type { ZmanimPreferences } from "./opinions";
import type { ZmanId } from "./zmanim";

describe("buildDefaultVisibleOpinions", () => {
  it("returns an object with 'zmanId:opinionId' keys", () => {
    const visible = buildDefaultVisibleOpinions();
    expect(visible["alos:degrees_16_1"]).toBe(true);
    expect(visible["alos:degrees_19_8"]).toBe(false);
  });

  it("includes every zman:opinion combination", () => {
    const visible = buildDefaultVisibleOpinions();
    let expectedCount = 0;
    for (const zmanId of Object.keys(ZMANIM) as ZmanId[]) {
      expectedCount += Object.keys(ZMANIM[zmanId].opinions).length;
    }
    expect(Object.keys(visible)).toHaveLength(expectedCount);
  });
});

describe("buildDefaultPrimaryOpinions", () => {
  it("returns one opinion per zman", () => {
    const primary = buildDefaultPrimaryOpinions();
    const zmanIds = Object.keys(ZMANIM) as ZmanId[];
    expect(Object.keys(primary)).toHaveLength(zmanIds.length);
  });

  it("picks the first defaultVisible opinion for each zman", () => {
    const primary = buildDefaultPrimaryOpinions();
    expect(primary["alos"]).toBe("degrees_16_1");
    expect(primary["tzeis"]).toBe("degrees_8_5");
    expect(primary["sofZmanShma"]).toBe("gra");
  });
});

describe("DEFAULT_PREFERENCES", () => {
  it("has expected default values", () => {
    expect(DEFAULT_PREFERENCES.use24Hour).toBe(false);
    expect(DEFAULT_PREFERENCES.showSeconds).toBe(false);
    expect(DEFAULT_PREFERENCES.language).toBe("en");
    expect(DEFAULT_PREFERENCES.candleLightingMinutes).toBe(18);
    expect(DEFAULT_PREFERENCES.savedLocations).toEqual([]);
    expect(DEFAULT_PREFERENCES.activeLocationIndex).toBe(0);
  });

  it("visibleOpinions match buildDefaultVisibleOpinions", () => {
    const expected = buildDefaultVisibleOpinions();
    expect(DEFAULT_PREFERENCES.visibleOpinions).toEqual(expected);
  });

  it("primaryOpinions match buildDefaultPrimaryOpinions", () => {
    const expected = buildDefaultPrimaryOpinions();
    expect(DEFAULT_PREFERENCES.primaryOpinions).toEqual(expected);
  });
});
