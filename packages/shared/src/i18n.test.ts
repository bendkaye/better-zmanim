import { describe, it, expect } from "vitest";
import { LANGUAGES } from "./i18n";
import type { Language, I18nLabels } from "./i18n";

describe("i18n", () => {
  it("exports LANGUAGES with en, he, and translit", () => {
    expect(LANGUAGES.en).toBe("en");
    expect(LANGUAGES.he).toBe("he");
    expect(LANGUAGES.translit).toBe("translit");
  });

  it("LANGUAGES has exactly 3 keys", () => {
    expect(Object.keys(LANGUAGES)).toHaveLength(3);
  });

  it("Language type accepts valid languages", () => {
    const lang: Language = "en";
    expect(lang).toBe("en");
  });

  it("I18nLabels requires all three language fields", () => {
    const labels: I18nLabels = {
      en: "Sunrise",
      he: "הנץ החמה",
      translit: "HaNetz HaChama",
    };
    expect(labels.en).toBe("Sunrise");
    expect(labels.he).toBe("הנץ החמה");
    expect(labels.translit).toBe("HaNetz HaChama");
  });
});
