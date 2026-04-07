import { describe, it, expect } from "vitest";
import { ZMAN_CATEGORIES, ZMANIM } from "./zmanim";
import type { ZmanId, ZmanCategory } from "./zmanim";

describe("ZMAN_CATEGORIES", () => {
  it("has exactly 8 categories", () => {
    expect(Object.keys(ZMAN_CATEGORIES)).toHaveLength(8);
  });

  it("contains all expected categories", () => {
    const expected = [
      "dawn",
      "morning",
      "shma",
      "tefila",
      "midday",
      "afternoon",
      "evening",
      "night",
    ];
    expect(Object.values(ZMAN_CATEGORIES)).toEqual(expected);
  });
});

describe("ZMANIM", () => {
  const zmanIds = Object.keys(ZMANIM) as ZmanId[];

  it("has 13 zmanim defined", () => {
    expect(zmanIds).toHaveLength(13);
  });

  it("contains all expected zman IDs", () => {
    const expected: ZmanId[] = [
      "alos",
      "misheyakir",
      "hanetz",
      "sofZmanShma",
      "sofZmanTefila",
      "chatzos",
      "minchaGedola",
      "minchaKetana",
      "plagHamincha",
      "shkia",
      "tzeis",
      "candleLighting",
      "havdalah",
    ];
    expect(zmanIds).toEqual(expected);
  });

  it("every zman has a valid category", () => {
    const validCategories = Object.values(ZMAN_CATEGORIES) as readonly string[];
    for (const id of zmanIds) {
      expect(
        validCategories,
        `${id} has invalid category "${ZMANIM[id].category}"`,
      ).toContain(ZMANIM[id].category);
    }
  });

  it("every zman has at least one opinion", () => {
    for (const id of zmanIds) {
      expect(
        Object.keys(ZMANIM[id].opinions).length,
        `${id} has no opinions`,
      ).toBeGreaterThan(0);
    }
  });

  it("every opinion has complete i18n names (en, he, translit)", () => {
    for (const id of zmanIds) {
      const opinions = ZMANIM[id].opinions;
      for (const [opId, opinion] of Object.entries(opinions)) {
        const op = opinion as {
          names: { en: string; he: string; translit: string };
        };
        expect(op.names.en, `${id}.${opId} missing en name`).toBeTruthy();
        expect(op.names.he, `${id}.${opId} missing he name`).toBeTruthy();
        expect(
          op.names.translit,
          `${id}.${opId} missing translit name`,
        ).toBeTruthy();
      }
    }
  });

  it("every opinion has a kosherZmanimMethod string", () => {
    for (const id of zmanIds) {
      const opinions = ZMANIM[id].opinions;
      for (const [opId, opinion] of Object.entries(opinions)) {
        const op = opinion as { kosherZmanimMethod: string };
        expect(
          op.kosherZmanimMethod,
          `${id}.${opId} missing kosherZmanimMethod`,
        ).toBeTruthy();
        expect(
          typeof op.kosherZmanimMethod,
          `${id}.${opId} kosherZmanimMethod is not a string`,
        ).toBe("string");
      }
    }
  });

  it("every opinion has a boolean defaultVisible", () => {
    for (const id of zmanIds) {
      const opinions = ZMANIM[id].opinions;
      for (const [opId, opinion] of Object.entries(opinions)) {
        const op = opinion as { defaultVisible: boolean };
        expect(
          typeof op.defaultVisible,
          `${id}.${opId} defaultVisible is not boolean`,
        ).toBe("boolean");
      }
    }
  });

  it("at least one opinion per zman is defaultVisible", () => {
    for (const id of zmanIds) {
      const opinions = Object.entries(ZMANIM[id].opinions);
      const hasDefault = opinions.some(
        ([_, op]) => (op as { defaultVisible: boolean }).defaultVisible,
      );
      expect(hasDefault, `${id} has no default-visible opinion`).toBe(true);
    }
  });

  it("alos has 4 opinions", () => {
    expect(Object.keys(ZMANIM.alos.opinions)).toHaveLength(4);
  });

  it("tzeis has 3 opinions", () => {
    expect(Object.keys(ZMANIM.tzeis.opinions)).toHaveLength(3);
  });
});
