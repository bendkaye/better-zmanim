import { describe, it, expect } from "vitest";
import { buildDayInfo } from "./day-info";

describe("buildDayInfo", () => {
  describe("Hebrew date", () => {
    it("returns correct Hebrew date fields for a known date", () => {
      // June 11, 2026 = 26 Sivan 5786 (Thursday)
      const info = buildDayInfo(new Date(2026, 5, 11));
      expect(info.hebrewDate.day).toBe(26);
      expect(info.hebrewDate.month).toBe("sivan");
      expect(info.hebrewDate.year).toBe(5786);
      expect(info.hebrewDate.isLeapYear).toBe(false);
    });

    it("has non-empty display strings", () => {
      const info = buildDayInfo(new Date(2026, 5, 11));
      expect(info.hebrewDate.displayHebrew).toBeTruthy();
      expect(info.hebrewDate.displayEnglish).toBeTruthy();
      expect(info.hebrewDate.displayTranslit).toBeTruthy();
    });
  });

  describe("Shabbos", () => {
    it("returns isShabbos=true on Saturday", () => {
      // June 13, 2026 is a Saturday
      const info = buildDayInfo(new Date(2026, 5, 13));
      expect(info.isShabbos).toBe(true);
    });

    it("returns isShabbos=false on a weekday", () => {
      const info = buildDayInfo(new Date(2026, 5, 11));
      expect(info.isShabbos).toBe(false);
    });

    it("returns parsha on Shabbos", () => {
      // June 13, 2026 = Parashat Sh'lach
      const info = buildDayInfo(new Date(2026, 5, 13));
      expect(info.parsha).not.toBeNull();
      expect(info.parsha?.names.en).toBeTruthy();
      expect(info.parsha?.names.he).toBeTruthy();
      expect(info.parsha?.names.translit).toBeTruthy();
    });

    it("returns no parsha on a weekday", () => {
      const info = buildDayInfo(new Date(2026, 5, 11));
      expect(info.parsha).toBeNull();
    });
  });

  describe("candle lighting and havdalah", () => {
    it("returns candleLighting=true on Friday", () => {
      // June 12, 2026 is a Friday
      const info = buildDayInfo(new Date(2026, 5, 12));
      expect(info.candleLighting).toBe(true);
    });

    it("returns havdalah=true on Saturday", () => {
      // June 13, 2026 is a Saturday
      const info = buildDayInfo(new Date(2026, 5, 13));
      expect(info.havdalah).toBe(true);
    });

    it("returns candleLighting=false on a regular weekday", () => {
      const info = buildDayInfo(new Date(2026, 5, 11));
      expect(info.candleLighting).toBe(false);
    });

    it("returns havdalah=false on a regular weekday", () => {
      const info = buildDayInfo(new Date(2026, 5, 11));
      expect(info.havdalah).toBe(false);
    });
  });

  describe("holidays", () => {
    it("returns empty holidays on a regular day", () => {
      // June 11, 2026 = plain Thursday with no holidays
      const info = buildDayInfo(new Date(2026, 5, 11));
      expect(info.holidays).toHaveLength(0);
    });

    it("returns Pesach on 15 Nisan", () => {
      // April 2, 2026 = 15 Nisan 5786 = Pesach I
      const info = buildDayInfo(new Date(2026, 3, 2));
      expect(info.holidays.length).toBeGreaterThan(0);
      const pesach = info.holidays.find((h) =>
        h.names.en.toLowerCase().includes("pesach"),
      );
      expect(pesach).toBeDefined();
      expect(pesach?.melachaProhibited).toBe(true);
      expect(pesach?.category).toBe("majorYomTov");
    });
  });

  describe("omer", () => {
    it("returns omerDay during omer period", () => {
      // April 3, 2026 = 16 Nisan 5786 = Omer day 1 (Diaspora)
      const info = buildDayInfo(new Date(2026, 3, 3));
      expect(info.omerDay).toBe(1);
    });

    it("returns null omerDay outside omer period", () => {
      // June 11, 2026 = after Shavuot, no omer
      const info = buildDayInfo(new Date(2026, 5, 11));
      expect(info.omerDay).toBeNull();
    });
  });
});
