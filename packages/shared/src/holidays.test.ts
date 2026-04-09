import { describe, it, expect } from "vitest";
import { HOLIDAY_CATEGORIES } from "./holidays";
import type { HolidayInfo, DayInfo } from "./holidays";

describe("HOLIDAY_CATEGORIES", () => {
  it("has exactly 6 categories", () => {
    expect(Object.keys(HOLIDAY_CATEGORIES)).toHaveLength(6);
  });

  it("contains all expected categories", () => {
    expect(HOLIDAY_CATEGORIES.majorYomTov).toBe("majorYomTov");
    expect(HOLIDAY_CATEGORIES.cholHamoed).toBe("cholHamoed");
    expect(HOLIDAY_CATEGORIES.minorHoliday).toBe("minorHoliday");
    expect(HOLIDAY_CATEGORIES.fastDay).toBe("fastDay");
    expect(HOLIDAY_CATEGORIES.roshChodesh).toBe("roshChodesh");
    expect(HOLIDAY_CATEGORIES.omer).toBe("omer");
  });
});

describe("HolidayInfo type", () => {
  it("can construct a valid HolidayInfo", () => {
    const info: HolidayInfo = {
      id: "rosh-hashana",
      category: "majorYomTov",
      names: { en: "Rosh Hashana", he: "ראש השנה", translit: "Rosh HaShana" },
      melachaProhibited: true,
      hasMussaf: true,
      hasHallel: false,
      hasTorahReading: true,
      fastStartsAtDawn: false,
      candleLightingApplies: true,
      havdalahApplies: true,
    };
    expect(info.melachaProhibited).toBe(true);
    expect(info.hasHallel).toBe(false);
  });

  it("hasHallel accepts 'full', 'half', and false", () => {
    const full: HolidayInfo["hasHallel"] = "full";
    const half: HolidayInfo["hasHallel"] = "half";
    const none: HolidayInfo["hasHallel"] = false;
    expect([full, half, none]).toEqual(["full", "half", false]);
  });
});

describe("DayInfo type", () => {
  it("can construct a valid DayInfo", () => {
    const day: DayInfo = {
      hebrewDate: {
        day: 7,
        month: "nisan",
        year: 5786,
        displayHebrew: "ז׳ ניסן תשפ״ו",
        displayEnglish: "7 Nisan 5786",
        displayTranslit: "7 Nisan 5786",
        isLeapYear: false,
      },
      isShabbos: false,
      holidays: [],
      parsha: null,
      omerDay: null,
      candleLighting: false,
      havdalah: false,
    };
    expect(day.isShabbos).toBe(false);
    expect(day.holidays).toHaveLength(0);
  });
});
