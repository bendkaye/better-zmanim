// apps/api/src/lib/compute.test.ts
import { describe, it, expect } from "vitest";
import { computeAllZmanim } from "./compute";
import { ZMANIM } from "@better-zmanim/shared";
import type { ZmanId } from "@better-zmanim/shared";

describe("computeAllZmanim", () => {
  // Jerusalem, April 9 2026
  const baseInput = {
    latitude: 31.7683,
    longitude: 35.2137,
    date: new Date(2026, 3, 9),
    elevation: 800,
  };

  it("returns an array of ZmanTimeResult", () => {
    const results = computeAllZmanim(baseInput);
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
  });

  it("returns one result per zman/opinion combo in ZMANIM", () => {
    const results = computeAllZmanim(baseInput);
    let expectedCount = 0;
    for (const zmanId of Object.keys(ZMANIM) as ZmanId[]) {
      expectedCount += Object.keys(ZMANIM[zmanId].opinions).length;
    }
    expect(results).toHaveLength(expectedCount);
  });

  it("each result has zmanId, opinionId, and time fields", () => {
    const results = computeAllZmanim(baseInput);
    for (const result of results) {
      expect(result).toHaveProperty("zmanId");
      expect(result).toHaveProperty("opinionId");
      expect(result).toHaveProperty("time");
    }
  });

  it("produces non-null times for standard zmanim in Jerusalem", () => {
    const results = computeAllZmanim(baseInput);
    const sunrise = results.find(
      (r) => r.zmanId === "hanetz" && r.opinionId === "standard",
    );
    expect(sunrise?.time).not.toBeNull();

    const sunset = results.find(
      (r) => r.zmanId === "shkia" && r.opinionId === "standard",
    );
    expect(sunset?.time).not.toBeNull();

    const chatzos = results.find(
      (r) => r.zmanId === "chatzos" && r.opinionId === "standard",
    );
    expect(chatzos?.time).not.toBeNull();
  });

  it("times are valid ISO 8601 strings", () => {
    const results = computeAllZmanim(baseInput);
    for (const result of results) {
      if (result.time !== null) {
        const parsed = new Date(result.time);
        expect(isNaN(parsed.getTime())).toBe(false);
      }
    }
  });

  it("sunrise is before sunset", () => {
    const results = computeAllZmanim(baseInput);
    const sunrise = results.find(
      (r) => r.zmanId === "hanetz" && r.opinionId === "standard",
    );
    const sunset = results.find(
      (r) => r.zmanId === "shkia" && r.opinionId === "standard",
    );
    expect(sunrise).toBeDefined();
    expect(sunset).toBeDefined();
    expect(new Date(sunrise?.time ?? "").getTime()).toBeLessThan(
      new Date(sunset?.time ?? "").getTime(),
    );
  });

  it("works without elevation", () => {
    const results = computeAllZmanim({
      latitude: 40.7128,
      longitude: -74.006,
      date: new Date(2026, 3, 9),
    });
    expect(results.length).toBeGreaterThan(0);
  });

  it("candle lighting time changes with offset", () => {
    const results18 = computeAllZmanim({
      ...baseInput,
      candleLightingOffset: 18,
    });
    const results40 = computeAllZmanim({
      ...baseInput,
      candleLightingOffset: 40,
    });
    const cl18 = results18.find(
      (r) => r.zmanId === "candleLighting" && r.opinionId === "standard",
    );
    const cl40 = results40.find(
      (r) => r.zmanId === "candleLighting" && r.opinionId === "standard",
    );
    // 40 min offset should be earlier than 18 min offset
    expect(cl40).toBeDefined();
    expect(cl18).toBeDefined();
    expect(new Date(cl40?.time ?? "").getTime()).toBeLessThan(
      new Date(cl18?.time ?? "").getTime(),
    );
  });
});
