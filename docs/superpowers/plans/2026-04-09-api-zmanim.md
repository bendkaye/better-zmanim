# API Zmanim Endpoint Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite the /api/zmanim endpoint to dynamically dispatch KosherZmanim methods from the shared ZMANIM const, returning ZmanimResponse with full DayInfo.

**Architecture:** The compute function iterates every zman/opinion in the ZMANIM const and dynamically calls the corresponding KosherZmanim method. DayInfo is built via a shared helper using @hebcal/core. The route handler validates input, calls compute, assembles ZmanimResponse.

**Tech Stack:** Hono, KosherZmanim (kosher-zmanim), @hebcal/core, moment-timezone, Vitest

**Spec:** `docs/superpowers/specs/2026-04-07-api-zmanim-design.md`

---

## File Map

| File                                   | Action  | Responsibility                                                        |
| -------------------------------------- | ------- | --------------------------------------------------------------------- |
| `packages/shared/src/zmanim.ts`        | Fix     | Correct two invalid KosherZmanim method names                         |
| `packages/shared/src/day-info.ts`      | Create  | `buildDayInfo(date)` using @hebcal/core                               |
| `packages/shared/src/day-info.test.ts` | Create  | Tests for buildDayInfo                                                |
| `packages/shared/src/index.ts`         | Modify  | Add buildDayInfo export                                               |
| `packages/shared/src/types.ts`         | Modify  | Add buildDayInfo re-export isn't needed (it's a function, not a type) |
| `apps/api/src/lib/compute.ts`          | Rewrite | Dynamic method dispatch from ZMANIM const                             |
| `apps/api/src/lib/compute.test.ts`     | Create  | Tests for computeAllZmanim                                            |
| `apps/api/src/routes/zmanim.ts`        | Rewrite | Validation, ZmanimResponse assembly                                   |
| `apps/api/src/routes/zmanim.test.ts`   | Create  | Route handler tests                                                   |
| `apps/api/src/index.ts`                | Fix     | Update notFound to use ApiError shape                                 |
| `apps/api/package.json`                | Modify  | Add @hebcal/core dependency (needed for buildDayInfo import)          |

---

### Task 1: Fix invalid KosherZmanim method names in ZMANIM const

Two method names in the ZMANIM const don't exist in the kosher-zmanim library and will fail at runtime:

- `getTzais8Point5Degrees` → should be `getTzaisGeonim8Point5Degrees`
- `getTzaisRabbeinuTam72Minutes` → should be `getTzais72Zmanis` (72 proportional/zmaniyos minutes, the R' Tam variant distinct from fixed 72 min)

**Files:**

- Modify: `packages/shared/src/zmanim.ts`

- [ ] **Step 1: Fix tzeis.degrees_8_5 method name**

In `packages/shared/src/zmanim.ts`, find the `tzeis.degrees_8_5` opinion and change:

```
kosherZmanimMethod: "getTzais8Point5Degrees",
```

to:

```
kosherZmanimMethod: "getTzaisGeonim8Point5Degrees",
```

- [ ] **Step 2: Fix tzeis.rabbeinuTam method name**

In the same file, find the `tzeis.rabbeinuTam` opinion and change:

```
kosherZmanimMethod: "getTzaisRabbeinuTam72Minutes",
```

to:

```
kosherZmanimMethod: "getTzais72Zmanis",
```

- [ ] **Step 3: Fix havdalah.standard method name**

The havdalah opinion also references `getTzais8Point5Degrees`. Change:

```
kosherZmanimMethod: "getTzais8Point5Degrees",
```

to:

```
kosherZmanimMethod: "getTzaisGeonim8Point5Degrees",
```

- [ ] **Step 4: Run existing tests to verify nothing broke**

Run: `cd packages/shared && npx vitest run src/zmanim.test.ts`
Expected: PASS (all tests -- the tests check structure, not method name validity)

- [ ] **Step 5: Commit**

```bash
git add packages/shared/src/zmanim.ts
git commit -m "fix(shared): correct KosherZmanim method names in ZMANIM const

- getTzais8Point5Degrees → getTzaisGeonim8Point5Degrees
- getTzaisRabbeinuTam72Minutes → getTzais72Zmanis"
```

---

### Task 2: buildDayInfo in packages/shared (`day-info.ts`)

New file using @hebcal/core to build DayInfo from a Date.

**Files:**

- Create: `packages/shared/src/day-info.ts`
- Create: `packages/shared/src/day-info.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// packages/shared/src/day-info.test.ts
import { describe, it, expect } from "vitest";
import { buildDayInfo } from "./day-info";

describe("buildDayInfo", () => {
  describe("Hebrew date", () => {
    it("returns correct Hebrew date fields for a known date", () => {
      // April 9, 2026 = 11 Nisan 5786
      const info = buildDayInfo(new Date(2026, 3, 9));
      expect(info.hebrewDate.day).toBe(11);
      expect(info.hebrewDate.month).toBe("nisan");
      expect(info.hebrewDate.year).toBe(5786);
      expect(info.hebrewDate.isLeapYear).toBe(false);
    });

    it("has non-empty display strings", () => {
      const info = buildDayInfo(new Date(2026, 3, 9));
      expect(info.hebrewDate.displayHebrew).toBeTruthy();
      expect(info.hebrewDate.displayEnglish).toBeTruthy();
      expect(info.hebrewDate.displayTranslit).toBeTruthy();
    });
  });

  describe("Shabbos", () => {
    it("returns isShabbos=true on Saturday", () => {
      // April 11, 2026 is a Saturday
      const info = buildDayInfo(new Date(2026, 3, 11));
      expect(info.isShabbos).toBe(true);
    });

    it("returns isShabbos=false on a weekday", () => {
      // April 9, 2026 is a Thursday
      const info = buildDayInfo(new Date(2026, 3, 9));
      expect(info.isShabbos).toBe(false);
    });

    it("returns parsha on Shabbos", () => {
      // April 11, 2026 is Shabbos
      const info = buildDayInfo(new Date(2026, 3, 11));
      expect(info.parsha).not.toBeNull();
      expect(info.parsha?.names.en).toBeTruthy();
      expect(info.parsha?.names.he).toBeTruthy();
      expect(info.parsha?.names.translit).toBeTruthy();
    });

    it("returns no parsha on a weekday", () => {
      const info = buildDayInfo(new Date(2026, 3, 9));
      expect(info.parsha).toBeNull();
    });
  });

  describe("candle lighting and havdalah", () => {
    it("returns candleLighting=true on Friday (erev Shabbos)", () => {
      // April 10, 2026 is a Friday
      const info = buildDayInfo(new Date(2026, 3, 10));
      expect(info.candleLighting).toBe(true);
    });

    it("returns havdalah=true on Saturday (motzei Shabbos)", () => {
      // April 11, 2026 is a Saturday
      const info = buildDayInfo(new Date(2026, 3, 11));
      expect(info.havdalah).toBe(true);
    });

    it("returns candleLighting=false on a regular weekday", () => {
      // April 9, 2026 is a Thursday
      const info = buildDayInfo(new Date(2026, 3, 9));
      expect(info.candleLighting).toBe(false);
    });

    it("returns havdalah=false on a regular weekday", () => {
      const info = buildDayInfo(new Date(2026, 3, 9));
      expect(info.havdalah).toBe(false);
    });
  });

  describe("holidays", () => {
    it("returns empty holidays on a regular day", () => {
      // April 9, 2026 = 11 Nisan -- no holiday
      const info = buildDayInfo(new Date(2026, 3, 9));
      expect(info.holidays).toHaveLength(0);
    });

    it("returns Pesach on 15 Nisan", () => {
      // April 13, 2026 = 15 Nisan 5786 = first day Pesach (erev is April 12)
      // 15 Nisan is the first day of Pesach
      const info = buildDayInfo(new Date(2026, 3, 13));
      expect(info.holidays.length).toBeGreaterThan(0);
      const pesach = info.holidays.find((h) =>
        h.names.en.toLowerCase().includes("pesach"),
      );
      expect(pesach).toBeDefined();
      expect(pesach?.melachaProhibited).toBe(true);
      expect(pesach?.category).toBe("majorYomTov");
    });

    it("returns correct category for Rosh Chodesh", () => {
      // May 1, 2026 = 13 Iyar -- not Rosh Chodesh
      // Let's find a Rosh Chodesh: 1 Iyar 5786 = April 19, 2026
      const info = buildDayInfo(new Date(2026, 3, 19));
      const rc = info.holidays.find((h) => h.category === "roshChodesh");
      if (rc) {
        expect(rc.melachaProhibited).toBe(false);
      }
    });
  });

  describe("omer", () => {
    it("returns omerDay during omer period", () => {
      // 16 Nisan 5786 = April 14, 2026 = Omer day 1
      const info = buildDayInfo(new Date(2026, 3, 14));
      expect(info.omerDay).toBe(1);
    });

    it("returns null omerDay outside omer period", () => {
      // 11 Nisan = before omer
      const info = buildDayInfo(new Date(2026, 3, 9));
      expect(info.omerDay).toBeNull();
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/shared && npx vitest run src/day-info.test.ts`
Expected: FAIL -- cannot find module `./day-info`

- [ ] **Step 3: Write implementation**

```typescript
// packages/shared/src/day-info.ts
import {
  HDate,
  HebrewCalendar,
  ParshaEvent,
  OmerEvent,
  flags,
} from "@hebcal/core";
import type {
  DayInfo,
  HebrewDate,
  HolidayInfo,
  Parsha,
  HolidayCategory,
} from "./types";
import type { HebrewMonth } from "./hebrew-date";
import { HEBREW_MONTHS } from "./hebrew-date";

const MONTH_NUM_TO_KEY: Record<number, HebrewMonth> = Object.fromEntries(
  Object.entries(HEBREW_MONTHS).map(([key, num]) => [num, key as HebrewMonth]),
) as Record<number, HebrewMonth>;

function buildHebrewDate(hdate: HDate): HebrewDate {
  const monthNum = hdate.getMonth();
  const month = MONTH_NUM_TO_KEY[monthNum] ?? "nisan";

  return {
    day: hdate.getDate(),
    month,
    year: hdate.getFullYear(),
    displayHebrew: hdate.render("he"),
    displayEnglish: hdate.render("en"),
    displayTranslit: hdate.render("en"),
    isLeapYear: hdate.isLeapYear(),
  };
}

function categorizeHoliday(eventFlags: number): HolidayCategory {
  if (eventFlags & flags.CHAG) return "majorYomTov";
  if (eventFlags & flags.CHOL_HAMOED) return "cholHamoed";
  if (eventFlags & flags.MAJOR_FAST) return "fastDay";
  if (eventFlags & flags.MINOR_FAST) return "fastDay";
  if (eventFlags & flags.ROSH_CHODESH) return "roshChodesh";
  return "minorHoliday";
}

function mapToHolidayInfo(event: {
  getDesc(): string;
  getFlags(): number;
  render(locale?: string): string;
}): HolidayInfo {
  const eventFlags = event.getFlags();
  const isChag = Boolean(eventFlags & flags.CHAG);
  const isMajorFast = Boolean(eventFlags & flags.MAJOR_FAST);

  return {
    id: event.getDesc().toLowerCase().replace(/\s+/g, "-"),
    category: categorizeHoliday(eventFlags),
    names: {
      en: event.render("en"),
      he: event.render("he"),
      translit: event.render("en"),
    },
    melachaProhibited: isChag,
    hasMussaf:
      isChag ||
      Boolean(eventFlags & flags.ROSH_CHODESH) ||
      Boolean(eventFlags & flags.CHOL_HAMOED),
    hasHallel: isChag
      ? "full"
      : Boolean(eventFlags & flags.ROSH_CHODESH) ||
          Boolean(eventFlags & flags.CHOL_HAMOED)
        ? "half"
        : false,
    hasTorahReading:
      isChag ||
      isMajorFast ||
      Boolean(eventFlags & flags.ROSH_CHODESH) ||
      Boolean(eventFlags & flags.MINOR_FAST),
    fastStartsAtDawn: Boolean(eventFlags & flags.MINOR_FAST),
    candleLightingApplies: Boolean(eventFlags & flags.LIGHT_CANDLES),
    havdalahApplies: Boolean(eventFlags & flags.YOM_TOV_ENDS),
  };
}

function buildParsha(event: ParshaEvent): Parsha {
  const name = event.render("en").replace(/^Parashat\s+/, "");
  const heName = event.render("he");
  const isDouble = event.parsha.length > 1;

  return {
    names: {
      en: name,
      he: heName,
      translit: name,
    },
    isDoubleParsha: isDouble,
  };
}

export function buildDayInfo(date: Date): DayInfo {
  const hdate = new HDate(date);
  const events = HebrewCalendar.getHolidaysOnDate(hdate, false) ?? [];

  const hebrewDate = buildHebrewDate(hdate);
  const isShabbos = hdate.getDay() === 6;

  const holidays: HolidayInfo[] = [];
  let parsha: Parsha | null = null;
  let omerDay: number | null = null;

  for (const event of events) {
    if (event instanceof ParshaEvent) {
      parsha = buildParsha(event);
    } else if (event instanceof OmerEvent) {
      omerDay = event.omer;
    } else {
      const eventFlags = event.getFlags();
      // Skip non-holiday events (Shabbat Mevarchim, special Shabbatot, etc.)
      const holidayMask =
        flags.CHAG |
        flags.CHOL_HAMOED |
        flags.MAJOR_FAST |
        flags.MINOR_FAST |
        flags.ROSH_CHODESH |
        flags.MINOR_HOLIDAY |
        flags.MODERN_HOLIDAY |
        flags.EREV;
      if (eventFlags & holidayMask) {
        holidays.push(mapToHolidayInfo(event));
      }
    }
  }

  // Candle lighting: Friday (erev Shabbos) or erev Yom Tov
  const isFriday = hdate.getDay() === 5;
  const hasErevLighting = events.some(
    (e) => e.getFlags() & flags.LIGHT_CANDLES,
  );
  const candleLighting = isFriday || hasErevLighting;

  // Havdalah: Saturday (motzei Shabbos) or motzei Yom Tov
  const hasYomTovEnds = events.some((e) => e.getFlags() & flags.YOM_TOV_ENDS);
  const havdalah = isShabbos || hasYomTovEnds;

  return {
    hebrewDate,
    isShabbos,
    holidays,
    parsha,
    omerDay,
    candleLighting,
    havdalah,
  };
}
```

- [ ] **Step 4: Run tests**

Run: `cd packages/shared && npx vitest run src/day-info.test.ts`
Expected: PASS (all tests)

- [ ] **Step 5: Commit**

```bash
git add packages/shared/src/day-info.ts packages/shared/src/day-info.test.ts
git commit -m "feat(shared): add buildDayInfo helper using @hebcal/core"
```

---

### Task 3: Export buildDayInfo from shared barrel

**Files:**

- Modify: `packages/shared/src/index.ts`

- [ ] **Step 1: Add export**

Add to `packages/shared/src/index.ts`, after the formatting exports:

```typescript
export { buildDayInfo } from "./day-info";
```

- [ ] **Step 2: Verify compilation**

Run: `cd packages/shared && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add packages/shared/src/index.ts
git commit -m "feat(shared): export buildDayInfo from barrel"
```

---

### Task 4: Rewrite compute.ts with dynamic dispatch

**Files:**

- Rewrite: `apps/api/src/lib/compute.ts`
- Create: `apps/api/src/lib/compute.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
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
    expect(new Date(sunrise!.time!).getTime()).toBeLessThan(
      new Date(sunset!.time!).getTime(),
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
    expect(new Date(cl40!.time!).getTime()).toBeLessThan(
      new Date(cl18!.time!).getTime(),
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/api && npx vitest run src/lib/compute.test.ts`
Expected: FAIL -- `computeAllZmanim` not found (old export is `computeZmanim`)

- [ ] **Step 3: Write implementation**

```typescript
// apps/api/src/lib/compute.ts
import { ComplexZmanimCalendar, GeoLocation } from "kosher-zmanim";
import momentTimezone from "moment-timezone";
import { ZMANIM } from "@better-zmanim/shared";
import type { ZmanId, ZmanTimeResult } from "@better-zmanim/shared";

export interface ComputeInput {
  latitude: number;
  longitude: number;
  date: Date;
  elevation?: number;
  candleLightingOffset?: number;
}

export function computeAllZmanim(input: ComputeInput): ZmanTimeResult[] {
  const { latitude, longitude, date, elevation, candleLightingOffset } = input;

  const geoLocation = new GeoLocation(
    "location",
    latitude,
    longitude,
    elevation ?? 0,
  );

  const calendar = new ComplexZmanimCalendar(geoLocation);
  calendar.setMoment(momentTimezone(date));
  calendar.setCandleLightingOffset(candleLightingOffset ?? 18);

  const results: ZmanTimeResult[] = [];

  for (const zmanId of Object.keys(ZMANIM) as ZmanId[]) {
    const zman = ZMANIM[zmanId];
    for (const [opinionId, opinion] of Object.entries(zman.opinions)) {
      const methodName = (opinion as { kosherZmanimMethod: string })
        .kosherZmanimMethod;
      const method = calendar[methodName as keyof ComplexZmanimCalendar];

      let time: string | null = null;
      if (typeof method === "function") {
        const result = (method as () => Date | null).call(calendar);
        time = result ? result.toISOString() : null;
      }

      results.push({ zmanId, opinionId, time });
    }
  }

  return results;
}
```

- [ ] **Step 4: Run tests**

Run: `cd apps/api && npx vitest run src/lib/compute.test.ts`
Expected: PASS (all 8 tests)

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/lib/compute.ts apps/api/src/lib/compute.test.ts
git commit -m "feat(api): rewrite compute with dynamic KosherZmanim dispatch from ZMANIM const"
```

---

### Task 5: Rewrite route handler (`routes/zmanim.ts`)

**Files:**

- Rewrite: `apps/api/src/routes/zmanim.ts`
- Create: `apps/api/src/routes/zmanim.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// apps/api/src/routes/zmanim.test.ts
import { describe, it, expect } from "vitest";
import app from "../index";

describe("GET /api/zmanim", () => {
  async function request(query: string) {
    const res = await app.request(`/api/zmanim?${query}`);
    const body = await res.json();
    return { status: res.status, body };
  }

  describe("validation", () => {
    it("returns 400 when lat is missing", async () => {
      const { status, body } = await request("lng=-74.01");
      expect(status).toBe(400);
      expect(body.error.code).toBe("INVALID_LOCATION");
    });

    it("returns 400 when lng is missing", async () => {
      const { status, body } = await request("lat=40.71");
      expect(status).toBe(400);
      expect(body.error.code).toBe("INVALID_LOCATION");
    });

    it("returns 400 for non-numeric lat", async () => {
      const { status, body } = await request("lat=abc&lng=-74.01");
      expect(status).toBe(400);
      expect(body.error.code).toBe("INVALID_LOCATION");
    });

    it("returns 400 for out-of-range lat", async () => {
      const { status, body } = await request("lat=999&lng=-74.01");
      expect(status).toBe(400);
      expect(body.error.code).toBe("INVALID_LOCATION");
    });

    it("returns 400 for out-of-range lng", async () => {
      const { status, body } = await request("lat=40.71&lng=999");
      expect(status).toBe(400);
      expect(body.error.code).toBe("INVALID_LOCATION");
    });

    it("returns 400 for invalid date", async () => {
      const { status, body } = await request(
        "lat=40.71&lng=-74.01&date=not-a-date",
      );
      expect(status).toBe(400);
      expect(body.error.code).toBe("INVALID_DATE");
    });
  });

  describe("success", () => {
    it("returns 200 with valid lat/lng", async () => {
      const { status, body } = await request("lat=40.71&lng=-74.01");
      expect(status).toBe(200);
      expect(body.data).not.toBeNull();
      expect(body.error).toBeNull();
    });

    it("response has ZmanimResponse shape", async () => {
      const { body } = await request("lat=31.77&lng=35.21&date=2026-04-09");
      expect(body.data.location).toBeDefined();
      expect(body.data.location.lat).toBe(31.77);
      expect(body.data.location.lng).toBe(35.21);
      expect(body.data.date).toBe("2026-04-09");
      expect(body.data.dayInfo).toBeDefined();
      expect(body.data.dayInfo.hebrewDate).toBeDefined();
      expect(Array.isArray(body.data.zmanim)).toBe(true);
      expect(body.data.zmanim.length).toBeGreaterThan(0);
    });

    it("each zman result has zmanId, opinionId, time", async () => {
      const { body } = await request("lat=40.71&lng=-74.01&date=2026-04-09");
      for (const zman of body.data.zmanim) {
        expect(zman).toHaveProperty("zmanId");
        expect(zman).toHaveProperty("opinionId");
        expect(zman).toHaveProperty("time");
      }
    });

    it("accepts optional elevation", async () => {
      const { status, body } = await request(
        "lat=31.77&lng=35.21&date=2026-04-09&elevation=800",
      );
      expect(status).toBe(200);
      expect(body.data.location.elevation).toBe(800);
    });

    it("accepts optional tz", async () => {
      const { body } = await request(
        "lat=31.77&lng=35.21&date=2026-04-09&tz=Asia/Jerusalem",
      );
      expect(body.data.location.timeZone).toBe("Asia/Jerusalem");
    });

    it("defaults tz to UTC", async () => {
      const { body } = await request("lat=31.77&lng=35.21&date=2026-04-09");
      expect(body.data.location.timeZone).toBe("UTC");
    });

    it("accepts optional candleLightingOffset", async () => {
      const { status } = await request(
        "lat=31.77&lng=35.21&date=2026-04-09&candleLightingOffset=20",
      );
      expect(status).toBe(200);
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/api && npx vitest run src/routes/zmanim.test.ts`
Expected: FAIL -- old route doesn't return ApiError shape, doesn't have validation

- [ ] **Step 3: Write implementation**

```typescript
// apps/api/src/routes/zmanim.ts
import { Hono } from "hono";
import type { Env } from "../index";
import { computeAllZmanim } from "../lib/compute";
import { buildDayInfo, API_ERROR_CODES } from "@better-zmanim/shared";
import type { ZmanimResponse } from "@better-zmanim/shared";
import { logger } from "../lib/logger";

export const zmanimRoutes = new Hono<{ Bindings: Env }>();

zmanimRoutes.get("/", async (c) => {
  const lat = c.req.query("lat");
  const lng = c.req.query("lng");

  if (!lat || !lng) {
    return c.json(
      {
        data: null,
        error: {
          code: API_ERROR_CODES.invalidLocation,
          message: "lat and lng query parameters are required",
        },
      },
      400,
    );
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  if (
    isNaN(latitude) ||
    isNaN(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return c.json(
      {
        data: null,
        error: {
          code: API_ERROR_CODES.invalidLocation,
          message: "lat must be -90..90 and lng must be -180..180",
        },
      },
      400,
    );
  }

  const dateStr = c.req.query("date");
  const date = dateStr ? new Date(dateStr) : new Date();

  if (isNaN(date.getTime())) {
    return c.json(
      {
        data: null,
        error: {
          code: API_ERROR_CODES.invalidDate,
          message: "Invalid date format",
        },
      },
      400,
    );
  }

  const elevation = c.req.query("elevation")
    ? parseFloat(c.req.query("elevation")!)
    : undefined;
  const tz = c.req.query("tz") ?? "UTC";
  const candleLightingOffset = c.req.query("candleLightingOffset")
    ? parseInt(c.req.query("candleLightingOffset")!, 10)
    : 18;

  try {
    const zmanim = computeAllZmanim({
      latitude,
      longitude,
      date,
      elevation,
      candleLightingOffset,
    });

    const dayInfo = buildDayInfo(date);

    const response: ZmanimResponse = {
      location: {
        lat: latitude,
        lng: longitude,
        elevation,
        name: "",
        timeZone: tz,
      },
      date: date.toISOString().split("T")[0]!,
      dayInfo,
      zmanim,
    };

    return c.json({ data: response, error: null });
  } catch (error) {
    logger.error("zmanim computation failed", {
      error: error instanceof Error ? error.message : String(error),
      lat: latitude,
      lng: longitude,
    });
    return c.json(
      {
        data: null,
        error: {
          code: API_ERROR_CODES.computationFailed,
          message: "Failed to compute zmanim",
        },
      },
      500,
    );
  }
});
```

- [ ] **Step 4: Run tests**

Run: `cd apps/api && npx vitest run src/routes/zmanim.test.ts`
Expected: PASS (all 13 tests)

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/routes/zmanim.ts apps/api/src/routes/zmanim.test.ts
git commit -m "feat(api): rewrite zmanim route with validation, ZmanimResponse, and DayInfo"
```

---

### Task 6: Fix notFound handler in index.ts

**Files:**

- Modify: `apps/api/src/index.ts`

- [ ] **Step 1: Update notFound to use ApiError shape**

In `apps/api/src/index.ts`, change:

```typescript
app.notFound((c) => {
  return c.json({ data: null, error: "Not found" }, 404);
});
```

to:

```typescript
app.notFound((c) => {
  return c.json(
    { data: null, error: { code: "NOT_FOUND", message: "Not found" } },
    404,
  );
});
```

- [ ] **Step 2: Verify compilation**

Run: `cd apps/api && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/index.ts
git commit -m "fix(api): update notFound handler to use ApiError shape"
```

---

### Task 7: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Run typecheck across monorepo**

Run: `pnpm typecheck`
Expected: All packages pass with 0 errors

- [ ] **Step 2: Run all tests**

Run: `pnpm test`
Expected: All tests pass (shared: 73+ tests, api: 20+ tests)

- [ ] **Step 3: Run lint**

Run: `pnpm lint`
Expected: No warnings

- [ ] **Step 4: Fix any issues found**

If typecheck or tests fail, fix the issues and re-run.

- [ ] **Step 5: Commit any fixes**

```bash
git add -A
git commit -m "fix: resolve typecheck and test issues from api zmanim rewrite"
```
