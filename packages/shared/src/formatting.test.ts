import { describe, it, expect } from "vitest";
import {
  formatHebrewDate,
  formatZmanTime,
  getZmanLabel,
  formatOmerCount,
} from "./formatting";

describe("getZmanLabel", () => {
  it("returns English label for alos degrees_16_1", () => {
    const label = getZmanLabel("alos", "degrees_16_1", "en");
    expect(label).toContain("Dawn");
    expect(label).toContain("16.1");
  });

  it("returns Hebrew label for shkia standard", () => {
    expect(getZmanLabel("shkia", "standard", "he")).toBe("שקיעה");
  });

  it("returns transliterated label for tzeis rabbeinuTam", () => {
    expect(getZmanLabel("tzeis", "rabbeinuTam", "translit")).toBe(
      "Tzeis HaKochavim (Rabbeinu Tam)",
    );
  });

  it("returns undefined for invalid zman/opinion combo", () => {
    expect(getZmanLabel("alos", "nonexistent", "en")).toBeUndefined();
  });
});

describe("formatOmerCount", () => {
  it("formats day 1 in English", () => {
    expect(formatOmerCount(1, "en")).toBe("Today is 1 day of the Omer");
  });

  it("formats day 7 with weeks in English", () => {
    expect(formatOmerCount(7, "en")).toBe(
      "Today is 7 days, which is 1 week of the Omer",
    );
  });

  it("formats day 33 with weeks and days in English", () => {
    expect(formatOmerCount(33, "en")).toBe(
      "Today is 33 days, which is 4 weeks and 5 days of the Omer",
    );
  });

  it("formats day 49 in English", () => {
    expect(formatOmerCount(49, "en")).toBe(
      "Today is 49 days, which is 7 weeks of the Omer",
    );
  });

  it("formats day 1 in Hebrew", () => {
    expect(formatOmerCount(1, "he")).toBe("היום יום אחד לעומר");
  });

  it("returns null for out-of-range days", () => {
    expect(formatOmerCount(0, "en")).toBeNull();
    expect(formatOmerCount(50, "en")).toBeNull();
  });
});

describe("formatZmanTime", () => {
  it("returns --:-- for null", () => {
    expect(formatZmanTime(null)).toBe("--:--");
  });

  it("formats a valid ISO time in 12-hour mode", () => {
    const result = formatZmanTime("2026-04-07T18:30:00.000Z", {
      use24Hour: false,
    });
    expect(result).toMatch(/\d{1,2}:\d{2}\s?(AM|PM)/);
  });

  it("formats a valid ISO time in 24-hour mode", () => {
    const result = formatZmanTime("2026-04-07T18:30:00.000Z", {
      use24Hour: true,
    });
    expect(result).toMatch(/\d{1,2}:\d{2}/);
    expect(result).not.toMatch(/AM|PM/);
  });
});

describe("formatHebrewDate", () => {
  it("returns a non-empty string for a valid date", () => {
    const result = formatHebrewDate(new Date("2026-04-07"));
    expect(result).toBeTruthy();
    expect(typeof result).toBe("string");
  });
});
