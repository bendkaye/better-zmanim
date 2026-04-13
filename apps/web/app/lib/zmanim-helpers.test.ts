import { describe, it, expect } from "vitest";
import { groupZmanimByCategory, findNextZman, countPastZmanim } from "./zmanim-helpers";
import type { ZmanTimeResult } from "@better-zmanim/shared";

const SAMPLE_ZMANIM: ZmanTimeResult[] = [
  { zmanId: "alos", opinionId: "degrees_16_1", time: "2026-04-13T04:52:00Z" },
  { zmanId: "hanetz", opinionId: "standard", time: "2026-04-13T06:23:00Z" },
  { zmanId: "sofZmanShma", opinionId: "gra", time: "2026-04-13T09:41:00Z" },
  { zmanId: "chatzos", opinionId: "standard", time: "2026-04-13T12:53:00Z" },
  { zmanId: "minchaGedola", opinionId: "standard", time: "2026-04-13T13:24:00Z" },
  { zmanId: "shkia", opinionId: "standard", time: "2026-04-13T19:35:00Z" },
  { zmanId: "tzeis", opinionId: "degrees_8_5", time: "2026-04-13T20:02:00Z" },
];

describe("groupZmanimByCategory", () => {
  it("groups zmanim into display categories", () => {
    const groups = groupZmanimByCategory(SAMPLE_ZMANIM);
    expect(groups).toHaveLength(3);
    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    expect(groups[0]!.label).toBe("morning");
    expect(groups[1]!.label).toBe("afternoon");
    expect(groups[2]!.label).toBe("evening");
    /* eslint-enable @typescript-eslint/no-non-null-assertion */
  });
  it("places each zman in the correct group", () => {
    const groups = groupZmanimByCategory(SAMPLE_ZMANIM);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const morningIds = groups[0]!.zmanim.map((z) => z.zmanId);
    expect(morningIds).toContain("alos");
    expect(morningIds).toContain("hanetz");
    expect(morningIds).toContain("sofZmanShma");
  });
});

describe("findNextZman", () => {
  it("returns the first zman after the given time", () => {
    const now = new Date("2026-04-13T10:00:00Z");
    const next = findNextZman(SAMPLE_ZMANIM, now);
    expect(next?.zmanId).toBe("chatzos");
  });
  it("returns null when all zmanim have passed", () => {
    const now = new Date("2026-04-13T21:00:00Z");
    const next = findNextZman(SAMPLE_ZMANIM, now);
    expect(next).toBeNull();
  });
  it("skips zmanim with null times", () => {
    const withNull: ZmanTimeResult[] = [
      { zmanId: "alos", opinionId: "degrees_16_1", time: null },
      { zmanId: "hanetz", opinionId: "standard", time: "2026-04-13T06:23:00Z" },
    ];
    const now = new Date("2026-04-13T05:00:00Z");
    const next = findNextZman(withNull, now);
    expect(next?.zmanId).toBe("hanetz");
  });
});

describe("countPastZmanim", () => {
  it("counts zmanim before the given time", () => {
    const now = new Date("2026-04-13T10:00:00Z");
    expect(countPastZmanim(SAMPLE_ZMANIM, now)).toBe(3);
  });
  it("returns 0 when no zmanim have passed", () => {
    const now = new Date("2026-04-13T03:00:00Z");
    expect(countPastZmanim(SAMPLE_ZMANIM, now)).toBe(0);
  });
});
