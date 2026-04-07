# Shared Types, Opinions & Zman Names Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the stub types in `packages/shared` with the full domain model -- zmanim, opinions, holidays, Hebrew dates, location, API types, i18n, constants, formatting, and API client.

**Architecture:** `as const` objects are the single source of truth. TypeScript types are derived from them. Each file owns one domain concept. The only runtime code is formatting utilities and the API client -- everything else is types and const objects.

**Tech Stack:** TypeScript 5.7, Vitest 3.1, @hebcal/core 5.8

**Spec:** `docs/superpowers/specs/2026-04-07-shared-types-design.md`

---

## File Map

| File                                      | Action  | Responsibility                                                                                   |
| ----------------------------------------- | ------- | ------------------------------------------------------------------------------------------------ |
| `packages/shared/src/i18n.ts`             | Create  | Language enum, I18nLabels interface                                                              |
| `packages/shared/src/zmanim.ts`           | Create  | ZMAN_CATEGORIES, ZMANIM const, derived ZmanId/ZmanCategory/OpinionId types                       |
| `packages/shared/src/holidays.ts`         | Create  | HOLIDAY_CATEGORIES, HolidayInfo, DayInfo                                                         |
| `packages/shared/src/hebrew-date.ts`      | Create  | HEBREW_MONTHS, HebrewDate, Parsha                                                                |
| `packages/shared/src/location.ts`         | Create  | Location interface, DEFAULT_LOCATIONS                                                            |
| `packages/shared/src/api.ts`              | Create  | ApiResponse, ApiError, ZmanTimeResult, ZmanimResponse, GeocodeResponse, HebDateResponse          |
| `packages/shared/src/constants.ts`        | Create  | DEFAULTS, GEOCODE_CACHE_TTL_SECONDS, API_ERROR_CODES                                             |
| `packages/shared/src/types.ts`            | Rewrite | Re-export all types from other files                                                             |
| `packages/shared/src/opinions.ts`         | Rewrite | ZmanimPreferences, DEFAULT_PREFERENCES, buildDefaultVisibleOpinions, buildDefaultPrimaryOpinions |
| `packages/shared/src/formatting.ts`       | Rewrite | formatHebrewDate, formatZmanTime, getZmanLabel, formatOmerCount                                  |
| `packages/shared/src/api-client.ts`       | Rewrite | createApiClient with all endpoints, typed returns                                                |
| `packages/shared/src/index.ts`            | Rewrite | Barrel exports for everything                                                                    |
| `packages/shared/src/i18n.test.ts`        | Create  | Tests for i18n types                                                                             |
| `packages/shared/src/zmanim.test.ts`      | Create  | Tests for ZMANIM const integrity                                                                 |
| `packages/shared/src/holidays.test.ts`    | Create  | Tests for holiday categories                                                                     |
| `packages/shared/src/hebrew-date.test.ts` | Create  | Tests for HEBREW_MONTHS const                                                                    |
| `packages/shared/src/location.test.ts`    | Create  | Tests for DEFAULT_LOCATIONS                                                                      |
| `packages/shared/src/constants.test.ts`   | Create  | Tests for constants integrity                                                                    |
| `packages/shared/src/opinions.test.ts`    | Create  | Tests for preferences defaults                                                                   |
| `packages/shared/src/formatting.test.ts`  | Create  | Tests for all formatting functions                                                               |
| `packages/shared/src/api-client.test.ts`  | Create  | Tests for API client URL construction and response parsing                                       |

---

### Task 1: Create feature branch

**Files:** none

- [ ] **Step 1: Create and switch to feature branch**

```bash
git checkout -b feature/shared-types
```

- [ ] **Step 2: Verify branch**

Run: `git branch --show-current`
Expected: `feature/shared-types`

---

### Task 2: i18n foundation (`i18n.ts`)

This must come first because every other file imports `I18nLabels` and `Language`.

**Files:**

- Create: `packages/shared/src/i18n.ts`
- Create: `packages/shared/src/i18n.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// packages/shared/src/i18n.test.ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/shared && npx vitest run src/i18n.test.ts`
Expected: FAIL -- cannot find module `./i18n`

- [ ] **Step 3: Write implementation**

```typescript
// packages/shared/src/i18n.ts
export const LANGUAGES = {
  en: "en",
  he: "he",
  translit: "translit",
} as const;

export type Language = keyof typeof LANGUAGES;

export interface I18nLabels {
  en: string;
  he: string;
  translit: string;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/shared && npx vitest run src/i18n.test.ts`
Expected: PASS (all 4 tests)

- [ ] **Step 5: Commit**

```bash
git add packages/shared/src/i18n.ts packages/shared/src/i18n.test.ts
git commit -m "feat(shared): add i18n foundation -- Language type and I18nLabels interface"
```

---

### Task 3: Zmanim model (`zmanim.ts`)

Core of the entire app. Depends on `i18n.ts` for `I18nLabels`.

**Files:**

- Create: `packages/shared/src/zmanim.ts`
- Create: `packages/shared/src/zmanim.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// packages/shared/src/zmanim.test.ts
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

  it("has 14 zmanim defined", () => {
    expect(zmanIds).toHaveLength(14);
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/shared && npx vitest run src/zmanim.test.ts`
Expected: FAIL -- cannot find module `./zmanim`

- [ ] **Step 3: Write implementation**

```typescript
// packages/shared/src/zmanim.ts
import type { I18nLabels } from "./i18n";

export const ZMAN_CATEGORIES = {
  dawn: "dawn",
  morning: "morning",
  shma: "shma",
  tefila: "tefila",
  midday: "midday",
  afternoon: "afternoon",
  evening: "evening",
  night: "night",
} as const;

export type ZmanCategory =
  (typeof ZMAN_CATEGORIES)[keyof typeof ZMAN_CATEGORIES];

interface OpinionDef {
  readonly names: I18nLabels;
  readonly kosherZmanimMethod: string;
  readonly defaultVisible: boolean;
}

interface ZmanDef {
  readonly category: ZmanCategory;
  readonly opinions: Readonly<Record<string, OpinionDef>>;
}

export const ZMANIM = {
  alos: {
    category: "dawn",
    opinions: {
      degrees_16_1: {
        names: {
          en: "Dawn (16.1\u00B0)",
          he: "\u05E2\u05DC\u05D5\u05EA \u05D4\u05E9\u05D7\u05E8",
          translit: "Alos HaShachar (16.1\u00B0)",
        },
        kosherZmanimMethod: "getAlos16Point1Degrees",
        defaultVisible: true,
      },
      degrees_19_8: {
        names: {
          en: "Dawn (19.8\u00B0)",
          he: "\u05E2\u05DC\u05D5\u05EA \u05D4\u05E9\u05D7\u05E8",
          translit: "Alos HaShachar (19.8\u00B0)",
        },
        kosherZmanimMethod: "getAlos19Point8Degrees",
        defaultVisible: false,
      },
      minutes_72: {
        names: {
          en: "Dawn (72 min)",
          he: "\u05E2\u05DC\u05D5\u05EA \u05D4\u05E9\u05D7\u05E8",
          translit: "Alos HaShachar (72 min)",
        },
        kosherZmanimMethod: "getAlos72",
        defaultVisible: false,
      },
      mga: {
        names: {
          en: "Dawn (MGA)",
          he: "\u05E2\u05DC\u05D5\u05EA \u05D4\u05E9\u05D7\u05E8 (\u05DE\u05D2\u05F4\u05D0)",
          translit: "Alos HaShachar (MGA)",
        },
        kosherZmanimMethod: "getAlos72Zmanis",
        defaultVisible: false,
      },
    },
  },
  misheyakir: {
    category: "dawn",
    opinions: {
      degrees_10_2: {
        names: {
          en: "Misheyakir (10.2\u00B0)",
          he: "\u05DE\u05E9\u05D9\u05DB\u05D9\u05E8",
          translit: "Misheyakir (10.2\u00B0)",
        },
        kosherZmanimMethod: "getMisheyakir10Point2Degrees",
        defaultVisible: true,
      },
      degrees_11: {
        names: {
          en: "Misheyakir (11\u00B0)",
          he: "\u05DE\u05E9\u05D9\u05DB\u05D9\u05E8",
          translit: "Misheyakir (11\u00B0)",
        },
        kosherZmanimMethod: "getMisheyakir11Degrees",
        defaultVisible: false,
      },
    },
  },
  hanetz: {
    category: "morning",
    opinions: {
      standard: {
        names: {
          en: "Sunrise",
          he: "\u05D4\u05E0\u05E5 \u05D4\u05D7\u05DE\u05D4",
          translit: "HaNetz HaChama",
        },
        kosherZmanimMethod: "getSunrise",
        defaultVisible: true,
      },
      elevated: {
        names: {
          en: "Sunrise (elevated)",
          he: "\u05D4\u05E0\u05E5 \u05D4\u05D7\u05DE\u05D4 (\u05D2\u05D5\u05D1\u05D4)",
          translit: "HaNetz HaChama (elevated)",
        },
        kosherZmanimMethod: "getElevationAdjustedSunrise",
        defaultVisible: false,
      },
    },
  },
  sofZmanShma: {
    category: "shma",
    opinions: {
      gra: {
        names: {
          en: "Latest Shma (GRA)",
          he: '\u05E1\u05D5\u05E3 \u05D6\u05DE\u05DF \u05E7"\u05E9 (\u05D2\u05E8"\u05D0)',
          translit: "Sof Zman Shma (GRA)",
        },
        kosherZmanimMethod: "getSofZmanShmaGRA",
        defaultVisible: true,
      },
      mga: {
        names: {
          en: "Latest Shma (MGA)",
          he: '\u05E1\u05D5\u05E3 \u05D6\u05DE\u05DF \u05E7"\u05E9 (\u05DE\u05D2"\u05D0)',
          translit: "Sof Zman Shma (MGA)",
        },
        kosherZmanimMethod: "getSofZmanShmaMGA",
        defaultVisible: true,
      },
    },
  },
  sofZmanTefila: {
    category: "tefila",
    opinions: {
      gra: {
        names: {
          en: "Latest Tefila (GRA)",
          he: '\u05E1\u05D5\u05E3 \u05D6\u05DE\u05DF \u05EA\u05E4\u05D9\u05DC\u05D4 (\u05D2\u05E8"\u05D0)',
          translit: "Sof Zman Tefila (GRA)",
        },
        kosherZmanimMethod: "getSofZmanTfilaGRA",
        defaultVisible: true,
      },
      mga: {
        names: {
          en: "Latest Tefila (MGA)",
          he: '\u05E1\u05D5\u05E3 \u05D6\u05DE\u05DF \u05EA\u05E4\u05D9\u05DC\u05D4 (\u05DE\u05D2"\u05D0)',
          translit: "Sof Zman Tefila (MGA)",
        },
        kosherZmanimMethod: "getSofZmanTfilaMGA",
        defaultVisible: true,
      },
    },
  },
  chatzos: {
    category: "midday",
    opinions: {
      standard: {
        names: {
          en: "Midday",
          he: "\u05D7\u05E6\u05D5\u05EA \u05D4\u05D9\u05D5\u05DD",
          translit: "Chatzos HaYom",
        },
        kosherZmanimMethod: "getChatzos",
        defaultVisible: true,
      },
    },
  },
  minchaGedola: {
    category: "afternoon",
    opinions: {
      standard: {
        names: {
          en: "Earliest Mincha",
          he: "\u05DE\u05E0\u05D7\u05D4 \u05D2\u05D3\u05D5\u05DC\u05D4",
          translit: "Mincha Gedola",
        },
        kosherZmanimMethod: "getMinchaGedola",
        defaultVisible: true,
      },
    },
  },
  minchaKetana: {
    category: "afternoon",
    opinions: {
      standard: {
        names: {
          en: "Mincha Ketana",
          he: "\u05DE\u05E0\u05D7\u05D4 \u05E7\u05D8\u05E0\u05D4",
          translit: "Mincha Ketana",
        },
        kosherZmanimMethod: "getMinchaKetana",
        defaultVisible: true,
      },
    },
  },
  plagHamincha: {
    category: "afternoon",
    opinions: {
      standard: {
        names: {
          en: "Plag HaMincha",
          he: "\u05E4\u05DC\u05D2 \u05D4\u05DE\u05E0\u05D7\u05D4",
          translit: "Plag HaMincha",
        },
        kosherZmanimMethod: "getPlagHamincha",
        defaultVisible: true,
      },
    },
  },
  shkia: {
    category: "evening",
    opinions: {
      standard: {
        names: {
          en: "Sunset",
          he: "\u05E9\u05E7\u05D9\u05E2\u05D4",
          translit: "Shkia",
        },
        kosherZmanimMethod: "getSunset",
        defaultVisible: true,
      },
      elevated: {
        names: {
          en: "Sunset (elevated)",
          he: "\u05E9\u05E7\u05D9\u05E2\u05D4 (\u05D2\u05D5\u05D1\u05D4)",
          translit: "Shkia (elevated)",
        },
        kosherZmanimMethod: "getElevationAdjustedSunset",
        defaultVisible: false,
      },
    },
  },
  tzeis: {
    category: "night",
    opinions: {
      degrees_8_5: {
        names: {
          en: "Nightfall (8.5\u00B0)",
          he: "\u05E6\u05D0\u05EA \u05D4\u05DB\u05D5\u05DB\u05D1\u05D9\u05DD",
          translit: "Tzeis HaKochavim (8.5\u00B0)",
        },
        kosherZmanimMethod: "getTzais8Point5Degrees",
        defaultVisible: true,
      },
      minutes_72: {
        names: {
          en: "Nightfall (72 min)",
          he: "\u05E6\u05D0\u05EA \u05D4\u05DB\u05D5\u05DB\u05D1\u05D9\u05DD (72 \u05D3\u05E7\u05D5\u05EA)",
          translit: "Tzeis HaKochavim (72 min)",
        },
        kosherZmanimMethod: "getTzais72",
        defaultVisible: false,
      },
      rabbeinuTam: {
        names: {
          en: "Nightfall (R' Tam)",
          he: '\u05E6\u05D0\u05EA \u05D4\u05DB\u05D5\u05DB\u05D1\u05D9\u05DD (\u05E8"\u05EA)',
          translit: "Tzeis HaKochavim (Rabbeinu Tam)",
        },
        kosherZmanimMethod: "getTzaisRabbeinuTam72Minutes",
        defaultVisible: false,
      },
    },
  },
  candleLighting: {
    category: "evening",
    opinions: {
      standard: {
        names: {
          en: "Candle Lighting",
          he: "\u05D4\u05D3\u05DC\u05E7\u05EA \u05E0\u05E8\u05D5\u05EA",
          translit: "Hadlakas Neiros",
        },
        kosherZmanimMethod: "getCandleLighting",
        defaultVisible: true,
      },
    },
  },
  havdalah: {
    category: "night",
    opinions: {
      standard: {
        names: {
          en: "Havdalah",
          he: "\u05D4\u05D1\u05D3\u05DC\u05D4",
          translit: "Havdalah",
        },
        kosherZmanimMethod: "getTzais8Point5Degrees",
        defaultVisible: true,
      },
    },
  },
} as const satisfies Record<string, ZmanDef>;

export type ZmanId = keyof typeof ZMANIM;

export type OpinionId<Z extends ZmanId> = keyof (typeof ZMANIM)[Z]["opinions"];
```

Note: The `satisfies Record<string, ZmanDef>` constrains the shape while preserving literal types for `as const`. The Hebrew strings use Unicode escapes so the file is safe in all editors, but the actual file can contain the raw Hebrew -- the formatter may convert them. Both forms are equivalent.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/shared && npx vitest run src/zmanim.test.ts`
Expected: PASS (all 10 tests)

- [ ] **Step 5: Commit**

```bash
git add packages/shared/src/zmanim.ts packages/shared/src/zmanim.test.ts
git commit -m "feat(shared): add ZMANIM const with 14 zmanim, per-zman opinions, and derived types"
```

---

### Task 4: Holidays (`holidays.ts`)

Depends on `i18n.ts` for `I18nLabels`.

**Files:**

- Create: `packages/shared/src/holidays.ts`
- Create: `packages/shared/src/holidays.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// packages/shared/src/holidays.test.ts
import { describe, it, expect } from "vitest";
import { HOLIDAY_CATEGORIES } from "./holidays";
import type { HolidayCategory, HolidayInfo, DayInfo } from "./holidays";

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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/shared && npx vitest run src/holidays.test.ts`
Expected: FAIL -- cannot find module `./holidays`

- [ ] **Step 3: Write implementation**

```typescript
// packages/shared/src/holidays.ts
import type { I18nLabels } from "./i18n";
import type { HebrewDate, Parsha } from "./hebrew-date";

export const HOLIDAY_CATEGORIES = {
  majorYomTov: "majorYomTov",
  cholHamoed: "cholHamoed",
  minorHoliday: "minorHoliday",
  fastDay: "fastDay",
  roshChodesh: "roshChodesh",
  omer: "omer",
} as const;

export type HolidayCategory =
  (typeof HOLIDAY_CATEGORIES)[keyof typeof HOLIDAY_CATEGORIES];

export interface HolidayInfo {
  id: string;
  category: HolidayCategory;
  names: I18nLabels;
  melachaProhibited: boolean;
  hasMussaf: boolean;
  hasHallel: "full" | "half" | false;
  hasTorahReading: boolean;
  fastStartsAtDawn: boolean;
  candleLightingApplies: boolean;
  havdalahApplies: boolean;
}

export interface DayInfo {
  hebrewDate: HebrewDate;
  isShabbos: boolean;
  holidays: HolidayInfo[];
  parsha: Parsha | null;
  omerDay: number | null;
  candleLighting: boolean;
  havdalah: boolean;
}
```

Note: This file imports `HebrewDate` and `Parsha` from `hebrew-date.ts`, which doesn't exist yet. We create it next. The test imports only from `holidays.ts` but constructs inline objects, so it will pass as long as the import of `hebrew-date.ts` resolves. We'll create `hebrew-date.ts` in the next step before running the test.

- [ ] **Step 4: Create hebrew-date.ts stub** (needed for holidays.ts to compile)

```typescript
// packages/shared/src/hebrew-date.ts
import type { I18nLabels } from "./i18n";

export const HEBREW_MONTHS = {
  nisan: 1,
  iyar: 2,
  sivan: 3,
  tammuz: 4,
  av: 5,
  elul: 6,
  tishrei: 7,
  cheshvan: 8,
  kislev: 9,
  teves: 10,
  shvat: 11,
  adarI: 12,
  adarII: 13,
} as const;

export type HebrewMonth = keyof typeof HEBREW_MONTHS;

export interface HebrewDate {
  day: number;
  month: HebrewMonth;
  year: number;
  displayHebrew: string;
  displayEnglish: string;
  displayTranslit: string;
  isLeapYear: boolean;
}

export interface Parsha {
  names: I18nLabels;
  isDoubleParsha: boolean;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd packages/shared && npx vitest run src/holidays.test.ts`
Expected: PASS (all 4 tests)

- [ ] **Step 6: Commit**

```bash
git add packages/shared/src/holidays.ts packages/shared/src/holidays.test.ts packages/shared/src/hebrew-date.ts
git commit -m "feat(shared): add holiday categories, HolidayInfo, DayInfo, and hebrew-date types"
```

---

### Task 5: Hebrew date tests (`hebrew-date.test.ts`)

The implementation was created in Task 4. Now add tests.

**Files:**

- Create: `packages/shared/src/hebrew-date.test.ts`

- [ ] **Step 1: Write the test**

```typescript
// packages/shared/src/hebrew-date.test.ts
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
      names: {
        en: "Bereishis",
        he: "בראשית",
        translit: "Bereishis",
      },
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
```

- [ ] **Step 2: Run test to verify it passes**

Run: `cd packages/shared && npx vitest run src/hebrew-date.test.ts`
Expected: PASS (all 6 tests)

- [ ] **Step 3: Commit**

```bash
git add packages/shared/src/hebrew-date.test.ts
git commit -m "test(shared): add hebrew-date tests for HEBREW_MONTHS, HebrewDate, and Parsha"
```

---

### Task 6: Location (`location.ts`)

**Files:**

- Create: `packages/shared/src/location.ts`
- Create: `packages/shared/src/location.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// packages/shared/src/location.test.ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/shared && npx vitest run src/location.test.ts`
Expected: FAIL -- cannot find module `./location`

- [ ] **Step 3: Write implementation**

```typescript
// packages/shared/src/location.ts
export interface Location {
  lat: number;
  lng: number;
  elevation?: number;
  name: string;
  timeZone: string;
}

export const DEFAULT_LOCATIONS = {
  jerusalem: {
    lat: 31.7683,
    lng: 35.2137,
    elevation: 800,
    name: "Jerusalem, Israel",
    timeZone: "Asia/Jerusalem",
  },
  newYork: {
    lat: 40.7128,
    lng: -74.006,
    name: "New York, NY",
    timeZone: "America/New_York",
  },
  losAngeles: {
    lat: 34.0522,
    lng: -118.2437,
    name: "Los Angeles, CA",
    timeZone: "America/Los_Angeles",
  },
  london: {
    lat: 51.5074,
    lng: -0.1278,
    name: "London, UK",
    timeZone: "Europe/London",
  },
} as const satisfies Record<string, Location>;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/shared && npx vitest run src/location.test.ts`
Expected: PASS (all 6 tests)

- [ ] **Step 5: Commit**

```bash
git add packages/shared/src/location.ts packages/shared/src/location.test.ts
git commit -m "feat(shared): add Location type and DEFAULT_LOCATIONS const"
```

---

### Task 7: API types (`api.ts`)

Depends on `zmanim.ts` for `ZmanId`, `location.ts` for `Location`, `holidays.ts` for `DayInfo`.

**Files:**

- Create: `packages/shared/src/api.ts`

- [ ] **Step 1: Write implementation**

No tests needed for a pure type file (no runtime values). Type correctness is enforced by the compiler and validated transitively by tests in other files that use these types.

```typescript
// packages/shared/src/api.ts
import type { ZmanId } from "./zmanim";
import type { Location } from "./location";
import type { DayInfo } from "./holidays";

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

export interface ApiError {
  code: string;
  message: string;
}

export interface ZmanTimeResult {
  zmanId: ZmanId;
  opinionId: string;
  time: string | null;
}

export interface ZmanimResponse {
  location: Location;
  date: string;
  dayInfo: DayInfo;
  zmanim: ZmanTimeResult[];
}

export interface GeocodeResponse {
  results: Location[];
}

export interface HebDateResponse {
  dayInfo: DayInfo;
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd packages/shared && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add packages/shared/src/api.ts
git commit -m "feat(shared): add API response types -- ApiResponse, ZmanimResponse, GeocodeResponse, HebDateResponse"
```

---

### Task 8: Constants (`constants.ts`)

**Files:**

- Create: `packages/shared/src/constants.ts`
- Create: `packages/shared/src/constants.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// packages/shared/src/constants.test.ts
import { describe, it, expect } from "vitest";
import {
  DEFAULTS,
  GEOCODE_CACHE_TTL_SECONDS,
  API_ERROR_CODES,
} from "./constants";

describe("DEFAULTS", () => {
  it("candle lighting is 18 minutes", () => {
    expect(DEFAULTS.candleLightingMinutes).toBe(18);
  });

  it("language defaults to en", () => {
    expect(DEFAULTS.language).toBe("en");
  });

  it("24-hour mode is off by default", () => {
    expect(DEFAULTS.use24Hour).toBe(false);
  });

  it("seconds are hidden by default", () => {
    expect(DEFAULTS.showSeconds).toBe(false);
  });
});

describe("GEOCODE_CACHE_TTL_SECONDS", () => {
  it("is 30 days in seconds", () => {
    expect(GEOCODE_CACHE_TTL_SECONDS).toBe(60 * 60 * 24 * 30);
  });
});

describe("API_ERROR_CODES", () => {
  it("has 5 error codes", () => {
    expect(Object.keys(API_ERROR_CODES)).toHaveLength(5);
  });

  it("all error codes are unique", () => {
    const values = Object.values(API_ERROR_CODES);
    expect(new Set(values).size).toBe(values.length);
  });

  it("error codes are SCREAMING_SNAKE_CASE", () => {
    for (const [key, value] of Object.entries(API_ERROR_CODES)) {
      expect(value, `${key} is not SCREAMING_SNAKE_CASE`).toMatch(
        /^[A-Z][A-Z_]+$/,
      );
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/shared && npx vitest run src/constants.test.ts`
Expected: FAIL -- cannot find module `./constants`

- [ ] **Step 3: Write implementation**

```typescript
// packages/shared/src/constants.ts
export const DEFAULTS = {
  candleLightingMinutes: 18,
  language: "en",
  use24Hour: false,
  showSeconds: false,
} as const;

export const GEOCODE_CACHE_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

export const API_ERROR_CODES = {
  invalidLocation: "INVALID_LOCATION",
  invalidDate: "INVALID_DATE",
  computationFailed: "COMPUTATION_FAILED",
  geocodeFailed: "GEOCODE_FAILED",
  notFound: "NOT_FOUND",
} as const;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/shared && npx vitest run src/constants.test.ts`
Expected: PASS (all 6 tests)

- [ ] **Step 5: Commit**

```bash
git add packages/shared/src/constants.ts packages/shared/src/constants.test.ts
git commit -m "feat(shared): add DEFAULTS, GEOCODE_CACHE_TTL, and API_ERROR_CODES constants"
```

---

### Task 9: Opinions / Preferences (`opinions.ts`)

Rewrite the existing file. Depends on `zmanim.ts`, `location.ts`, `i18n.ts`.

**Files:**

- Rewrite: `packages/shared/src/opinions.ts`
- Create: `packages/shared/src/opinions.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// packages/shared/src/opinions.test.ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/shared && npx vitest run src/opinions.test.ts`
Expected: FAIL -- named exports not found

- [ ] **Step 3: Write implementation**

```typescript
// packages/shared/src/opinions.ts
import type { Language } from "./i18n";
import type { Location } from "./location";
import type { ZmanId } from "./zmanim";
import { ZMANIM } from "./zmanim";

export interface ZmanimPreferences {
  visibleOpinions: Record<string, boolean>;
  primaryOpinions: Record<ZmanId, string>;
  use24Hour: boolean;
  showSeconds: boolean;
  language: Language;
  candleLightingMinutes: number;
  savedLocations: Location[];
  activeLocationIndex: number;
}

export function buildDefaultVisibleOpinions(): Record<string, boolean> {
  const visible: Record<string, boolean> = {};
  for (const zmanId of Object.keys(ZMANIM) as ZmanId[]) {
    const opinions = ZMANIM[zmanId].opinions;
    for (const [opinionId, opinion] of Object.entries(opinions)) {
      visible[`${zmanId}:${opinionId}`] = (
        opinion as { defaultVisible: boolean }
      ).defaultVisible;
    }
  }
  return visible;
}

export function buildDefaultPrimaryOpinions(): Record<ZmanId, string> {
  const primary = {} as Record<ZmanId, string>;
  for (const zmanId of Object.keys(ZMANIM) as ZmanId[]) {
    const opinions = Object.entries(ZMANIM[zmanId].opinions);
    const firstVisible = opinions.find(
      ([_, op]) => (op as { defaultVisible: boolean }).defaultVisible,
    );
    primary[zmanId] = firstVisible ? firstVisible[0] : opinions[0]![0];
  }
  return primary;
}

export const DEFAULT_PREFERENCES: ZmanimPreferences = {
  visibleOpinions: buildDefaultVisibleOpinions(),
  primaryOpinions: buildDefaultPrimaryOpinions(),
  use24Hour: false,
  showSeconds: false,
  language: "en",
  candleLightingMinutes: 18,
  savedLocations: [],
  activeLocationIndex: 0,
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/shared && npx vitest run src/opinions.test.ts`
Expected: PASS (all 6 tests)

- [ ] **Step 5: Commit**

```bash
git add packages/shared/src/opinions.ts packages/shared/src/opinions.test.ts
git commit -m "feat(shared): rewrite opinions with ZmanimPreferences, per-zman visibility and primary opinion builders"
```

---

### Task 10: Formatting (`formatting.ts`)

Rewrite the existing file. Depends on `i18n.ts`, `zmanim.ts`.

**Files:**

- Rewrite: `packages/shared/src/formatting.ts`
- Create: `packages/shared/src/formatting.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// packages/shared/src/formatting.test.ts
import { describe, it, expect } from "vitest";
import {
  formatHebrewDate,
  formatZmanTime,
  getZmanLabel,
  formatOmerCount,
} from "./formatting";

describe("getZmanLabel", () => {
  it("returns English label for alos degrees_16_1", () => {
    expect(getZmanLabel("alos", "degrees_16_1", "en")).toBe(
      "Dawn (16.1\u00B0)",
    );
  });

  it("returns Hebrew label for shkia standard", () => {
    expect(getZmanLabel("shkia", "standard", "he")).toBe(
      "\u05E9\u05E7\u05D9\u05E2\u05D4",
    );
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
    expect(formatOmerCount(1, "he")).toBe(
      "\u05D4\u05D9\u05D5\u05DD \u05D9\u05D5\u05DD \u05D0\u05D7\u05D3 \u05DC\u05E2\u05D5\u05DE\u05E8",
    );
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/shared && npx vitest run src/formatting.test.ts`
Expected: FAIL -- `getZmanLabel` and `formatOmerCount` not found

- [ ] **Step 3: Write implementation**

```typescript
// packages/shared/src/formatting.ts
import { HDate } from "@hebcal/core";
import type { Language } from "./i18n";
import type { ZmanId } from "./zmanim";
import { ZMANIM } from "./zmanim";

export function formatHebrewDate(date: Date): string {
  const hdate = new HDate(date);
  return hdate.render("he");
}

export function formatZmanTime(
  isoTime: string | null,
  options?: { use24Hour?: boolean; showSeconds?: boolean },
): string {
  if (!isoTime) return "--:--";

  const date = new Date(isoTime);
  const use24Hour = options?.use24Hour ?? false;
  const showSeconds = options?.showSeconds ?? false;

  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: showSeconds ? "2-digit" : undefined,
    hour12: !use24Hour,
  });
}

export function getZmanLabel(
  zmanId: string,
  opinionId: string,
  language: Language,
): string | undefined {
  const zman = ZMANIM[zmanId as ZmanId];
  if (!zman) return undefined;

  const opinions = zman.opinions as Record<
    string,
    { names: Record<Language, string> }
  >;
  const opinion = opinions[opinionId];
  if (!opinion) return undefined;

  return opinion.names[language];
}

const HEBREW_NUMBERS = [
  "",
  "\u05D0\u05D7\u05D3",
  "\u05E9\u05E0\u05D9",
  "\u05E9\u05DC\u05E9\u05D4",
  "\u05D0\u05E8\u05D1\u05E2\u05D4",
  "\u05D7\u05DE\u05E9\u05D4",
  "\u05E9\u05E9\u05D4",
  "\u05E9\u05D1\u05E2\u05D4",
  "\u05E9\u05DE\u05D5\u05E0\u05D4",
  "\u05EA\u05E9\u05E2\u05D4",
  "\u05E2\u05E9\u05E8\u05D4",
  "\u05D0\u05D7\u05D3 \u05E2\u05E9\u05E8",
  "\u05E9\u05E0\u05D9\u05DD \u05E2\u05E9\u05E8",
  "\u05E9\u05DC\u05E9\u05D4 \u05E2\u05E9\u05E8",
  "\u05D0\u05E8\u05D1\u05E2\u05D4 \u05E2\u05E9\u05E8",
  "\u05D7\u05DE\u05E9\u05D4 \u05E2\u05E9\u05E8",
  "\u05E9\u05E9\u05D4 \u05E2\u05E9\u05E8",
  "\u05E9\u05D1\u05E2\u05D4 \u05E2\u05E9\u05E8",
  "\u05E9\u05DE\u05D5\u05E0\u05D4 \u05E2\u05E9\u05E8",
  "\u05EA\u05E9\u05E2\u05D4 \u05E2\u05E9\u05E8",
  "\u05E2\u05E9\u05E8\u05D9\u05DD",
  "\u05E2\u05E9\u05E8\u05D9\u05DD \u05D5\u05D0\u05D7\u05D3",
  "\u05E2\u05E9\u05E8\u05D9\u05DD \u05D5\u05E9\u05E0\u05D9\u05DD",
  "\u05E2\u05E9\u05E8\u05D9\u05DD \u05D5\u05E9\u05DC\u05E9\u05D4",
  "\u05E2\u05E9\u05E8\u05D9\u05DD \u05D5\u05D0\u05E8\u05D1\u05E2\u05D4",
  "\u05E2\u05E9\u05E8\u05D9\u05DD \u05D5\u05D7\u05DE\u05E9\u05D4",
  "\u05E2\u05E9\u05E8\u05D9\u05DD \u05D5\u05E9\u05E9\u05D4",
  "\u05E2\u05E9\u05E8\u05D9\u05DD \u05D5\u05E9\u05D1\u05E2\u05D4",
  "\u05E2\u05E9\u05E8\u05D9\u05DD \u05D5\u05E9\u05DE\u05D5\u05E0\u05D4",
  "\u05E2\u05E9\u05E8\u05D9\u05DD \u05D5\u05EA\u05E9\u05E2\u05D4",
  "\u05E9\u05DC\u05E9\u05D9\u05DD",
  "\u05E9\u05DC\u05E9\u05D9\u05DD \u05D5\u05D0\u05D7\u05D3",
  "\u05E9\u05DC\u05E9\u05D9\u05DD \u05D5\u05E9\u05E0\u05D9\u05DD",
  "\u05E9\u05DC\u05E9\u05D9\u05DD \u05D5\u05E9\u05DC\u05E9\u05D4",
  "\u05E9\u05DC\u05E9\u05D9\u05DD \u05D5\u05D0\u05E8\u05D1\u05E2\u05D4",
  "\u05E9\u05DC\u05E9\u05D9\u05DD \u05D5\u05D7\u05DE\u05E9\u05D4",
  "\u05E9\u05DC\u05E9\u05D9\u05DD \u05D5\u05E9\u05E9\u05D4",
  "\u05E9\u05DC\u05E9\u05D9\u05DD \u05D5\u05E9\u05D1\u05E2\u05D4",
  "\u05E9\u05DC\u05E9\u05D9\u05DD \u05D5\u05E9\u05DE\u05D5\u05E0\u05D4",
  "\u05E9\u05DC\u05E9\u05D9\u05DD \u05D5\u05EA\u05E9\u05E2\u05D4",
  "\u05D0\u05E8\u05D1\u05E2\u05D9\u05DD",
  "\u05D0\u05E8\u05D1\u05E2\u05D9\u05DD \u05D5\u05D0\u05D7\u05D3",
  "\u05D0\u05E8\u05D1\u05E2\u05D9\u05DD \u05D5\u05E9\u05E0\u05D9\u05DD",
  "\u05D0\u05E8\u05D1\u05E2\u05D9\u05DD \u05D5\u05E9\u05DC\u05E9\u05D4",
  "\u05D0\u05E8\u05D1\u05E2\u05D9\u05DD \u05D5\u05D0\u05E8\u05D1\u05E2\u05D4",
  "\u05D0\u05E8\u05D1\u05E2\u05D9\u05DD \u05D5\u05D7\u05DE\u05E9\u05D4",
  "\u05D0\u05E8\u05D1\u05E2\u05D9\u05DD \u05D5\u05E9\u05E9\u05D4",
  "\u05D0\u05E8\u05D1\u05E2\u05D9\u05DD \u05D5\u05E9\u05D1\u05E2\u05D4",
  "\u05D0\u05E8\u05D1\u05E2\u05D9\u05DD \u05D5\u05E9\u05DE\u05D5\u05E0\u05D4",
  "\u05D0\u05E8\u05D1\u05E2\u05D9\u05DD \u05D5\u05EA\u05E9\u05E2\u05D4",
] as const;

export function formatOmerCount(
  day: number,
  language: Language,
): string | null {
  if (day < 1 || day > 49) return null;

  if (language === "he") {
    const dayWord = HEBREW_NUMBERS[day];
    if (day === 1) {
      return `\u05D4\u05D9\u05D5\u05DD \u05D9\u05D5\u05DD ${dayWord} \u05DC\u05E2\u05D5\u05DE\u05E8`;
    }
    return `\u05D4\u05D9\u05D5\u05DD ${dayWord} \u05D9\u05DE\u05D9\u05DD \u05DC\u05E2\u05D5\u05DE\u05E8`;
  }

  // English and transliterated share the same format
  const weeks = Math.floor(day / 7);
  const days = day % 7;

  const dayStr = day === 1 ? "1 day" : `${day} days`;

  if (weeks === 0) {
    return `Today is ${dayStr} of the Omer`;
  }

  const weekStr = weeks === 1 ? "1 week" : `${weeks} weeks`;

  if (days === 0) {
    return `Today is ${dayStr}, which is ${weekStr} of the Omer`;
  }

  const remainderStr = days === 1 ? "1 day" : `${days} days`;
  return `Today is ${dayStr}, which is ${weekStr} and ${remainderStr} of the Omer`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/shared && npx vitest run src/formatting.test.ts`
Expected: PASS (all 10 tests)

- [ ] **Step 5: Commit**

```bash
git add packages/shared/src/formatting.ts packages/shared/src/formatting.test.ts
git commit -m "feat(shared): rewrite formatting with getZmanLabel and formatOmerCount"
```

---

### Task 11: API client (`api-client.ts`)

Rewrite with typed returns for all endpoints.

**Files:**

- Rewrite: `packages/shared/src/api-client.ts`
- Create: `packages/shared/src/api-client.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// packages/shared/src/api-client.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createApiClient } from "./api-client";

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch);
  mockFetch.mockReset();
});

describe("createApiClient", () => {
  const client = createApiClient({ baseUrl: "https://api.example.com" });

  describe("getZmanim", () => {
    it("constructs correct URL with required params", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: null, error: null }),
      });

      await client.getZmanim({ lat: 40.71, lng: -74.01 });

      const calledUrl = mockFetch.mock.calls[0]![0] as string;
      expect(calledUrl).toContain("https://api.example.com/api/zmanim?");
      expect(calledUrl).toContain("lat=40.71");
      expect(calledUrl).toContain("lng=-74.01");
    });

    it("includes optional date and elevation", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: null, error: null }),
      });

      await client.getZmanim({
        lat: 31.77,
        lng: 35.21,
        date: "2026-04-07",
        elevation: 800,
      });

      const calledUrl = mockFetch.mock.calls[0]![0] as string;
      expect(calledUrl).toContain("date=2026-04-07");
      expect(calledUrl).toContain("elevation=800");
    });
  });

  describe("getGeocode", () => {
    it("constructs correct URL with query", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { results: [] }, error: null }),
      });

      await client.getGeocode({ q: "Jerusalem" });

      const calledUrl = mockFetch.mock.calls[0]![0] as string;
      expect(calledUrl).toBe("https://api.example.com/api/geocode?q=Jerusalem");
    });

    it("encodes special characters in query", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { results: [] }, error: null }),
      });

      await client.getGeocode({ q: "New York, NY" });

      const calledUrl = mockFetch.mock.calls[0]![0] as string;
      expect(calledUrl).toContain("q=New+York");
    });
  });

  describe("getHebDate", () => {
    it("constructs URL without date param when omitted", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: null, error: null }),
      });

      await client.getHebDate({});

      const calledUrl = mockFetch.mock.calls[0]![0] as string;
      expect(calledUrl).toBe("https://api.example.com/api/hebdate");
    });

    it("includes date param when provided", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: null, error: null }),
      });

      await client.getHebDate({ date: "2026-04-07" });

      const calledUrl = mockFetch.mock.calls[0]![0] as string;
      expect(calledUrl).toBe(
        "https://api.example.com/api/hebdate?date=2026-04-07",
      );
    });
  });

  describe("getHealth", () => {
    it("calls the health endpoint", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { status: "ok", version: "1.0.0" },
          error: null,
        }),
      });

      const result = await client.getHealth();

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/api/health",
      );
      expect(result.data?.status).toBe("ok");
    });
  });

  describe("error handling", () => {
    it("returns API error from response body", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: null,
          error: { code: "INVALID_LOCATION", message: "Bad coords" },
        }),
      });

      const result = await client.getZmanim({ lat: 999, lng: 999 });
      expect(result.error?.code).toBe("INVALID_LOCATION");
    });

    it("returns network error when fetch throws", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network failed"));

      const result = await client.getZmanim({ lat: 40, lng: -74 });
      expect(result.data).toBeNull();
      expect(result.error?.code).toBe("NETWORK_ERROR");
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/shared && npx vitest run src/api-client.test.ts`
Expected: FAIL -- `getGeocode` and `getHebDate` not found, network error handling missing

- [ ] **Step 3: Write implementation**

```typescript
// packages/shared/src/api-client.ts
import type { ApiResponse } from "./api";
import type { ZmanimResponse, GeocodeResponse, HebDateResponse } from "./api";

interface ApiClientConfig {
  baseUrl: string;
}

interface FetchZmanimParams {
  lat: number;
  lng: number;
  date?: string;
  elevation?: number;
}

interface FetchGeocodeParams {
  q: string;
}

interface FetchHebDateParams {
  date?: string;
}

export function createApiClient(config: ApiClientConfig) {
  async function fetchJson<T>(path: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${config.baseUrl}${path}`);
      return (await response.json()) as ApiResponse<T>;
    } catch (error) {
      return {
        data: null,
        error: {
          code: "NETWORK_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }

  return {
    getZmanim(params: FetchZmanimParams) {
      const searchParams = new URLSearchParams({
        lat: params.lat.toString(),
        lng: params.lng.toString(),
      });
      if (params.date) searchParams.set("date", params.date);
      if (params.elevation !== undefined) {
        searchParams.set("elevation", params.elevation.toString());
      }
      return fetchJson<ZmanimResponse>(
        `/api/zmanim?${searchParams.toString()}`,
      );
    },

    getGeocode(params: FetchGeocodeParams) {
      const searchParams = new URLSearchParams({ q: params.q });
      return fetchJson<GeocodeResponse>(
        `/api/geocode?${searchParams.toString()}`,
      );
    },

    getHebDate(params: FetchHebDateParams) {
      if (params.date) {
        const searchParams = new URLSearchParams({ date: params.date });
        return fetchJson<HebDateResponse>(
          `/api/hebdate?${searchParams.toString()}`,
        );
      }
      return fetchJson<HebDateResponse>("/api/hebdate");
    },

    getHealth() {
      return fetchJson<{ status: string; version: string }>("/api/health");
    },
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/shared && npx vitest run src/api-client.test.ts`
Expected: PASS (all 8 tests)

- [ ] **Step 5: Commit**

```bash
git add packages/shared/src/api-client.ts packages/shared/src/api-client.test.ts
git commit -m "feat(shared): rewrite API client with geocode, hebdate endpoints and error handling"
```

---

### Task 12: Types re-export (`types.ts`) and barrel (`index.ts`)

Wire everything together.

**Files:**

- Rewrite: `packages/shared/src/types.ts`
- Rewrite: `packages/shared/src/index.ts`

- [ ] **Step 1: Write types.ts**

```typescript
// packages/shared/src/types.ts

// i18n
export type { Language, I18nLabels } from "./i18n";

// Zmanim
export type { ZmanId, ZmanCategory, OpinionId } from "./zmanim";

// Holidays
export type { HolidayCategory, HolidayInfo, DayInfo } from "./holidays";

// Hebrew date
export type { HebrewMonth, HebrewDate, Parsha } from "./hebrew-date";

// Location
export type { Location } from "./location";

// API
export type {
  ApiResponse,
  ApiError,
  ZmanTimeResult,
  ZmanimResponse,
  GeocodeResponse,
  HebDateResponse,
} from "./api";

// Opinions / Preferences
export type { ZmanimPreferences } from "./opinions";
```

- [ ] **Step 2: Write index.ts**

```typescript
// packages/shared/src/index.ts

// Re-export all types
export type {
  Language,
  I18nLabels,
  ZmanId,
  ZmanCategory,
  OpinionId,
  HolidayCategory,
  HolidayInfo,
  DayInfo,
  HebrewMonth,
  HebrewDate,
  Parsha,
  Location,
  ApiResponse,
  ApiError,
  ZmanTimeResult,
  ZmanimResponse,
  GeocodeResponse,
  HebDateResponse,
  ZmanimPreferences,
} from "./types";

// Re-export runtime constants
export { LANGUAGES } from "./i18n";
export { ZMAN_CATEGORIES, ZMANIM } from "./zmanim";
export { HOLIDAY_CATEGORIES } from "./holidays";
export { HEBREW_MONTHS } from "./hebrew-date";
export { DEFAULT_LOCATIONS } from "./location";
export {
  DEFAULTS,
  GEOCODE_CACHE_TTL_SECONDS,
  API_ERROR_CODES,
} from "./constants";
export {
  DEFAULT_PREFERENCES,
  buildDefaultVisibleOpinions,
  buildDefaultPrimaryOpinions,
} from "./opinions";

// Re-export functions
export {
  formatHebrewDate,
  formatZmanTime,
  getZmanLabel,
  formatOmerCount,
} from "./formatting";
export { createApiClient } from "./api-client";
```

- [ ] **Step 3: Verify everything compiles**

Run: `cd packages/shared && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Run all tests**

Run: `cd packages/shared && npx vitest run`
Expected: All tests pass

- [ ] **Step 5: Commit**

```bash
git add packages/shared/src/types.ts packages/shared/src/index.ts
git commit -m "feat(shared): rewrite barrel exports and types re-export for full domain model"
```

---

### Task 13: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Run typecheck across the entire monorepo**

Run: `pnpm typecheck`
Expected: No errors. If `apps/api` or `apps/web` have type errors from the changed exports, fix the imports in this step.

- [ ] **Step 2: Run all tests**

Run: `pnpm test`
Expected: All pass

- [ ] **Step 3: Run lint**

Run: `pnpm lint`
Expected: No warnings

- [ ] **Step 4: Fix any import breakages in apps/api**

The existing `apps/api/src/routes/zmanim.ts` and `apps/api/src/index.ts` import from `@better-zmanim/shared`. The old exports (`ZmanimOpinion`, `ZmanTime`, `ZMANIM_OPINIONS`) no longer exist. Update these imports:

In `apps/api/src/routes/zmanim.ts`, replace any import of the old `ZmanTime` or `ApiResponse` types with the new ones from `@better-zmanim/shared`:

```typescript
// Old:
import type { ApiResponse } from "@better-zmanim/shared";
// New (same name, different shape -- error field is now ApiError | null instead of string | null):
import type { ApiResponse } from "@better-zmanim/shared";
```

The `ApiResponse` type name is the same but the `error` field changed from `string | null` to `ApiError | null`. Update any API route that constructs a response to use `{ code, message }` for errors instead of plain strings.

- [ ] **Step 5: Re-run full verification after fixes**

Run: `pnpm typecheck && pnpm test && pnpm lint`
Expected: All pass

- [ ] **Step 6: Commit any fixes**

```bash
git add -A
git commit -m "fix(api): update imports for new shared package types"
```
