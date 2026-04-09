# API Zmanim Endpoint Design

Session 2 of the Better Zmanim build. Core API endpoint for computing zmanim times.

## Decisions

- **Dynamic dispatch:** Iterate `ZMANIM` const from shared package, call `kosherZmanimMethod` dynamically on `ComplexZmanimCalendar`
- **Timezone:** Deferred to geocode endpoint (Session 3). Accept optional `tz` param, default "UTC". KosherZmanim returns absolute UTC timestamps regardless.
- **DayInfo:** Built via `buildDayInfo(date)` helper in `packages/shared` using `@hebcal/core`. Centralized, reusable by all consumers.
- **Filtering:** Always return all zmanim for all opinions. Client filters using `DayInfo` flags.
- **Candle lighting:** Use `ComplexZmanimCalendar.setCandleLightingOffset(minutes)`. Accept optional `candleLightingOffset` query param, default 18.
- **Error format:** Use `ApiError` shape (`{ code, message }`) from shared types.

## Endpoint

`GET /api/zmanim`

### Query Parameters

| Param                  | Required | Default | Description                  |
| ---------------------- | -------- | ------- | ---------------------------- |
| `lat`                  | yes      | -       | Latitude (-90 to 90)         |
| `lng`                  | yes      | -       | Longitude (-180 to 180)      |
| `date`                 | no       | today   | ISO date string (YYYY-MM-DD) |
| `elevation`            | no       | 0       | Elevation in meters          |
| `tz`                   | no       | "UTC"   | IANA timezone string         |
| `candleLightingOffset` | no       | 18      | Minutes before shkia         |

### Response

```typescript
{
  data: {
    location: { lat, lng, elevation?, name: "", timeZone },
    date: "YYYY-MM-DD",
    dayInfo: DayInfo,
    zmanim: ZmanTimeResult[]  // one entry per zman/opinion combo
  },
  error: null
}
```

### Error Responses

| Code               | HTTP | When                                          |
| ------------------ | ---- | --------------------------------------------- |
| INVALID_LOCATION   | 400  | Missing, non-numeric, or out-of-range lat/lng |
| INVALID_DATE       | 400  | Unparseable date string                       |
| COMPUTATION_FAILED | 500  | KosherZmanim internal error                   |

## File Structure

```
apps/api/src/
  index.ts              -- minor: update notFound error format
  routes/zmanim.ts      -- rewrite: validation, ZmanimResponse assembly
  lib/compute.ts        -- rewrite: dynamic method dispatch from ZMANIM const
  lib/logger.ts         -- unchanged

packages/shared/src/
  day-info.ts           -- NEW: buildDayInfo(date) using @hebcal/core
  day-info.test.ts      -- NEW: tests for buildDayInfo
  index.ts              -- add buildDayInfo export
```

## Compute Function (`apps/api/src/lib/compute.ts`)

Rewritten to dynamically dispatch KosherZmanim methods based on the `ZMANIM` const:

```typescript
import { ComplexZmanimCalendar, GeoLocation } from "kosher-zmanim";
import { ZMANIM } from "@better-zmanim/shared";
import type { ZmanId, ZmanTimeResult } from "@better-zmanim/shared";

interface ComputeInput {
  latitude: number;
  longitude: number;
  date: Date;
  elevation?: number;
  candleLightingOffset?: number;
}

function computeAllZmanim(input: ComputeInput): ZmanTimeResult[] {
  const geoLocation = new GeoLocation(
    "location",
    input.latitude,
    input.longitude,
    input.elevation ?? 0,
  );
  const calendar = new ComplexZmanimCalendar(geoLocation);
  calendar.setDate(input.date);
  calendar.setCandleLightingOffset(input.candleLightingOffset ?? 18);

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

- Iterates every zman/opinion in ZMANIM const
- Calls `calendar[methodName]` dynamically
- Returns `ZmanTimeResult[]` with `zmanId`, `opinionId`, `time` (ISO string or null)
- Null-safe: methods returning null (polar regions) produce `time: null`

## Route Handler (`apps/api/src/routes/zmanim.ts`)

Validates input, calls compute, builds DayInfo, assembles ZmanimResponse:

- Parse lat/lng (required), validate numeric and range
- Parse date (optional, default today), validate parseable
- Parse elevation, tz, candleLightingOffset (all optional with defaults)
- Call `computeAllZmanim()` for zmanim times
- Call `buildDayInfo(date)` for Hebrew date/holiday info
- Assemble and return `ZmanimResponse`
- Error responses use `ApiError` shape with codes from `API_ERROR_CODES`
- Try/catch around compute for unexpected errors (500 COMPUTATION_FAILED)

## DayInfo Builder (`packages/shared/src/day-info.ts`)

New file using `@hebcal/core`:

```typescript
export function buildDayInfo(date: Date): DayInfo;
```

Uses `HDate`, `HebrewCalendar.getHolidaysOnDate()`, `ParshaEvent`, `OmerEvent`, and event flags to build:

- `hebrewDate`: HebrewDate with display strings in Hebrew, English, transliterated
- `isShabbos`: day === 6
- `holidays`: HolidayInfo[] mapped from hebcal events with category, melacha, hallel, Torah reading flags
- `parsha`: Parsha from ParshaEvent or null
- `omerDay`: number from OmerEvent or null
- `candleLighting`: true on erev Shabbos or erev Yom Tov
- `havdalah`: true on motzei Shabbos or motzei Yom Tov

Helper functions:

- `buildHebrewDate(hdate)` -- extracts day/month/year and renders display strings
- `mapToHolidayInfo(event)` -- maps hebcal event to HolidayInfo interface
- `buildParsha(event)` -- extracts parsha names
- `isErevShabbosOrYomTov(hdate, events)` -- checks if candle lighting applies
- `isMotzeiShabbosOrYomTov(hdate, events)` -- checks if havdalah applies

## Testing

### `apps/api/src/lib/compute.test.ts`

- Returns ZmanTimeResult[] with correct structure
- Every zman/opinion in ZMANIM has a corresponding result
- Known location/date (e.g., Jerusalem, 2026-04-07) produces non-null times
- Candle lighting offset is respected
- Polar region returns null times gracefully

### `apps/api/src/routes/zmanim.test.ts`

- 400 on missing lat/lng
- 400 on out-of-range lat/lng (lat=999)
- 400 on invalid date (date=not-a-date)
- 200 with valid params returns ZmanimResponse shape
- Response has correct number of ZmanTimeResult entries
- Default date is today when omitted
- Optional elevation and tz params work
- candleLightingOffset param works

### `packages/shared/src/day-info.test.ts`

- Regular weekday: no holidays, no parsha, omerDay null
- Shabbos: isShabbos=true, parsha present
- Known Yom Tov (e.g., 15 Nisan): correct holiday with melachaProhibited=true
- Omer period (e.g., 16 Nisan - 5 Sivan): correct omerDay
- Erev Shabbos (Friday): candleLighting=true
- Motzei Shabbos (Saturday night): havdalah=true
- Rosh Chodesh: correct category
