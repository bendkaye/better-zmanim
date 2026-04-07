# Shared Types, Opinions & Zman Names Design

Session 1 of the Better Zmanim build. Foundation package (`packages/shared`) that all apps depend on.

## Decisions

- **Approach:** `as const` objects as single source of truth, TypeScript types derived from them
- **Opinion model:** Per-zman opinions. API returns all opinions for each zman; UI controls visibility and primary selection
- **i18n:** English + Hebrew + transliterated Hebrew (`I18nLabels` on every displayable string)
- **Holidays:** Categorized enum system with flags that drive UI behavior (melacha, candle lighting, havdalah, etc.)
- **Zman identifiers:** Composite key -- `ZmanId` + `OpinionId` (e.g., `"tzeis"` + `"degrees_8_5"`)

## File Structure

```
packages/shared/src/
  index.ts              -- barrel exports
  types.ts              -- re-exports all types from other files
  zmanim.ts             -- ZMANIM const object + derived types
  opinions.ts           -- preference types, profile defaults
  holidays.ts           -- holiday categories, HolidayInfo, DayInfo
  hebrew-date.ts        -- Hebrew month/date/parsha types
  location.ts           -- Location type + default locations
  api.ts                -- API request/response types
  i18n.ts               -- Language enum, I18nLabels
  constants.ts          -- app-wide defaults, TTLs, error codes
  formatting.ts         -- label lookups, date/time formatting
  api-client.ts         -- fetch-based API client
```

## Zmanim Model (`zmanim.ts`)

Core `as const` object. Each zman has a category and a map of opinions. Each opinion has i18n names, a KosherZmanim method reference, and a default visibility flag.

### Categories

```typescript
const ZMAN_CATEGORIES = {
  dawn: "dawn",
  morning: "morning",
  shma: "shma",
  tefila: "tefila",
  midday: "midday",
  afternoon: "afternoon",
  evening: "evening",
  night: "night",
} as const;
```

### ZMANIM Object

```typescript
const ZMANIM = {
  alos: {
    category: "dawn",
    opinions: {
      degrees_16_1: {
        names: {
          en: "Dawn (16.1deg)",
          he: "עלות השחר",
          translit: "Alos HaShachar (16.1deg)",
        },
        kosherZmanimMethod: "getAlos16Point1Degrees",
        defaultVisible: true,
      },
      degrees_19_8: {
        names: {
          en: "Dawn (19.8deg)",
          he: "עלות השחר",
          translit: "Alos HaShachar (19.8deg)",
        },
        kosherZmanimMethod: "getAlos19Point8Degrees",
        defaultVisible: false,
      },
      minutes_72: {
        names: {
          en: "Dawn (72 min)",
          he: "עלות השחר",
          translit: "Alos HaShachar (72 min)",
        },
        kosherZmanimMethod: "getAlos72",
        defaultVisible: false,
      },
      mga: {
        names: {
          en: "Dawn (MGA)",
          he: "עלות השחר (מג״א)",
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
          en: "Misheyakir (10.2deg)",
          he: "משיכיר",
          translit: "Misheyakir (10.2deg)",
        },
        kosherZmanimMethod: "getMisheyakir10Point2Degrees",
        defaultVisible: true,
      },
      degrees_11: {
        names: {
          en: "Misheyakir (11deg)",
          he: "משיכיר",
          translit: "Misheyakir (11deg)",
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
        names: { en: "Sunrise", he: "הנץ החמה", translit: "HaNetz HaChama" },
        kosherZmanimMethod: "getSunrise",
        defaultVisible: true,
      },
      elevated: {
        names: {
          en: "Sunrise (elevated)",
          he: "הנץ החמה (גובה)",
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
          he: 'סוף זמן ק"ש (גר"א)',
          translit: "Sof Zman Shma (GRA)",
        },
        kosherZmanimMethod: "getSofZmanShmaGRA",
        defaultVisible: true,
      },
      mga: {
        names: {
          en: "Latest Shma (MGA)",
          he: 'סוף זמן ק"ש (מג"א)',
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
          he: 'סוף זמן תפילה (גר"א)',
          translit: "Sof Zman Tefila (GRA)",
        },
        kosherZmanimMethod: "getSofZmanTfilaGRA",
        defaultVisible: true,
      },
      mga: {
        names: {
          en: "Latest Tefila (MGA)",
          he: 'סוף זמן תפילה (מג"א)',
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
        names: { en: "Midday", he: "חצות היום", translit: "Chatzos HaYom" },
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
          he: "מנחה גדולה",
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
          he: "מנחה קטנה",
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
          he: "פלג המנחה",
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
        names: { en: "Sunset", he: "שקיעה", translit: "Shkia" },
        kosherZmanimMethod: "getSunset",
        defaultVisible: true,
      },
      elevated: {
        names: {
          en: "Sunset (elevated)",
          he: "שקיעה (גובה)",
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
          en: "Nightfall (8.5deg)",
          he: "צאת הכוכבים",
          translit: "Tzeis HaKochavim (8.5deg)",
        },
        kosherZmanimMethod: "getTzais8Point5Degrees",
        defaultVisible: true,
      },
      minutes_72: {
        names: {
          en: "Nightfall (72 min)",
          he: "צאת הכוכבים (72 דקות)",
          translit: "Tzeis HaKochavim (72 min)",
        },
        kosherZmanimMethod: "getTzais72",
        defaultVisible: false,
      },
      rabbeinuTam: {
        names: {
          en: "Nightfall (R' Tam)",
          he: 'צאת הכוכבים (ר"ת)',
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
          he: "הדלקת נרות",
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
        names: { en: "Havdalah", he: "הבדלה", translit: "Havdalah" },
        kosherZmanimMethod: "getTzais8Point5Degrees",
        defaultVisible: true,
      },
    },
  },
} as const;
```

### Derived Types

```typescript
type ZmanId = keyof typeof ZMANIM;
type ZmanCategory = (typeof ZMAN_CATEGORIES)[keyof typeof ZMAN_CATEGORIES];
type OpinionId<Z extends ZmanId> = keyof (typeof ZMANIM)[Z]["opinions"];
```

## Holidays (`holidays.ts`)

### Categories

```typescript
const HOLIDAY_CATEGORIES = {
  majorYomTov: "majorYomTov",
  cholHamoed: "cholHamoed",
  minorHoliday: "minorHoliday",
  fastDay: "fastDay",
  roshChodesh: "roshChodesh",
  omer: "omer",
} as const;

type HolidayCategory =
  (typeof HOLIDAY_CATEGORIES)[keyof typeof HOLIDAY_CATEGORIES];
```

### HolidayInfo

```typescript
interface HolidayInfo {
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
```

### DayInfo

```typescript
interface DayInfo {
  hebrewDate: HebrewDate;
  isShabbos: boolean;
  holidays: HolidayInfo[];
  parsha: Parsha | null;
  omerDay: number | null;
  candleLighting: boolean;
  havdalah: boolean;
}
```

## Hebrew Date (`hebrew-date.ts`)

```typescript
const HEBREW_MONTHS = {
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

type HebrewMonth = keyof typeof HEBREW_MONTHS;

interface HebrewDate {
  day: number;
  month: HebrewMonth;
  year: number;
  displayHebrew: string;
  displayEnglish: string;
  displayTranslit: string;
  isLeapYear: boolean;
}

interface Parsha {
  names: I18nLabels;
  isDoubleParsha: boolean;
}
```

## Location (`location.ts`)

```typescript
interface Location {
  lat: number;
  lng: number;
  elevation?: number;
  name: string;
  timeZone: string;
}

const DEFAULT_LOCATIONS = {
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

## API Types (`api.ts`)

```typescript
interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

interface ApiError {
  code: string;
  message: string;
}

interface ZmanTimeResult {
  zmanId: ZmanId;
  opinionId: string;
  time: string | null;
}

interface ZmanimResponse {
  location: Location;
  date: string;
  dayInfo: DayInfo;
  zmanim: ZmanTimeResult[];
}

interface GeocodeResponse {
  results: Location[];
}

interface HebDateResponse {
  dayInfo: DayInfo;
}
```

## Preferences (`opinions.ts`)

```typescript
interface ZmanimPreferences {
  visibleOpinions: Record<string, boolean>; // key: "zmanId:opinionId"
  primaryOpinions: Record<ZmanId, string>; // key: zmanId, value: opinionId
  use24Hour: boolean;
  showSeconds: boolean;
  language: Language;
  candleLightingMinutes: number;
  savedLocations: Location[];
  activeLocationIndex: number;
}
```

## i18n (`i18n.ts`)

```typescript
const LANGUAGES = {
  en: "en",
  he: "he",
  translit: "translit",
} as const;

type Language = keyof typeof LANGUAGES;

interface I18nLabels {
  en: string;
  he: string;
  translit: string;
}
```

## Constants (`constants.ts`)

```typescript
const DEFAULTS = {
  candleLightingMinutes: 18,
  language: "en",
  use24Hour: false,
  showSeconds: false,
} as const;

const GEOCODE_CACHE_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

const API_ERROR_CODES = {
  invalidLocation: "INVALID_LOCATION",
  invalidDate: "INVALID_DATE",
  computationFailed: "COMPUTATION_FAILED",
  geocodeFailed: "GEOCODE_FAILED",
  notFound: "NOT_FOUND",
} as const;
```

## Formatting (`formatting.ts`)

Expanding the existing file with:

- `getZmanLabel(zmanId, opinionId, language)` -- looks up display name from ZMANIM const
- `formatOmerCount(day, language)` -- e.g., "Today is 7 days, which is 1 week of the Omer"

Existing `formatHebrewDate` and `formatZmanTime` remain.

## API Client (`api-client.ts`)

Expanding the existing file to support all three endpoints:

- `getZmanim(params: { lat, lng, date?, elevation? })` -> `ZmanimResponse`
- `getGeocode(params: { q: string })` -> `GeocodeResponse`
- `getHebDate(params: { date?: string })` -> `HebDateResponse`
- `getHealth()` -> `{ status: string, version: string }`

## Testing

All files get co-located tests. Key test areas:

- Type derivation: verify `ZmanId`, `OpinionId` unions match expected values
- ZMANIM const: every entry has valid category, all required i18n fields, valid method name
- Formatting: label lookups for all zman/opinion combos, omer counting edge cases
- API client: mock fetch, verify URL construction, response parsing, error handling
- Constants: verify defaults are sane, error codes are unique
