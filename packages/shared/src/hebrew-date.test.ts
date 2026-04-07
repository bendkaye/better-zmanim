import { describe, it, expect } from "vitest";
import { HEBREW_MONTHS } from "./hebrew-date";
import type { HebrewMonth, HebrewDate, Parsha } from "./hebrew-date";

describe("HEBREW_MONTHS", () => {
  it("has exactly 13 months (including Adar II)", () => {
    expect(Object.keys(HEBREW_MONTHS)).toHaveLength(13);
  });

  it("nisan is 1 and adarII is 13", () => {
    expect(HEBREW_MONTHS.nisan).toBe(1);
    expect(HEBREW_MONTHS.adarII).toBe(13);
  });

  it("months are numbered 1-13 with no gaps", () => {
    const values = Object.values(HEBREW_MONTHS).sort((a, b) => a - b);
    expect(values).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
  });

  it("tishrei is 7 (first month of civil year)", () => {
    expect(HEBREW_MONTHS.tishrei).toBe(7);
  });
});

describe("HebrewDate type", () => {
  it("can construct a valid HebrewDate", () => {
    const date: HebrewDate = {
      day: 1,
      month: "tishrei",
      year: 5786,
      displayHebrew: "א׳ תשרי תשפ״ו",
      displayEnglish: "1 Tishrei 5786",
      displayTranslit: "1 Tishrei 5786",
      isLeapYear: false,
    };
    expect(date.day).toBe(1);
    expect(date.month).toBe("tishrei");
  });
});

describe("Parsha type", () => {
  it("can construct a single parsha", () => {
    const parsha: Parsha = {
      names: { en: "Bereishis", he: "בראשית", translit: "Bereishis" },
      isDoubleParsha: false,
    };
    expect(parsha.isDoubleParsha).toBe(false);
  });

  it("can construct a double parsha", () => {
    const parsha: Parsha = {
      names: {
        en: "Vayakhel-Pekudei",
        he: "ויקהל-פקודי",
        translit: "Vayakhel-Pekudei",
      },
      isDoubleParsha: true,
    };
    expect(parsha.isDoubleParsha).toBe(true);
  });
});
