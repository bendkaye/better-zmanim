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

interface HebcalEvent {
  getDesc(): string;
  getFlags(): number;
  render(locale?: string): string;
}

function mapToHolidayInfo(event: HebcalEvent): HolidayInfo {
  const eventFlags = event.getFlags();
  const isChag = Boolean(eventFlags & flags.CHAG);
  const isMajorFast = Boolean(eventFlags & flags.MAJOR_FAST);
  const isMinorFast = Boolean(eventFlags & flags.MINOR_FAST);
  const isRoshChodesh = Boolean(eventFlags & flags.ROSH_CHODESH);
  const isCholHamoed = Boolean(eventFlags & flags.CHOL_HAMOED);

  return {
    id: event.getDesc().toLowerCase().replace(/\s+/g, "-"),
    category: categorizeHoliday(eventFlags),
    names: {
      en: event.render("en"),
      he: event.render("he"),
      translit: event.render("en"),
    },
    melachaProhibited: isChag,
    hasMussaf: isChag || isRoshChodesh || isCholHamoed,
    hasHallel: isChag ? "full" : isRoshChodesh || isCholHamoed ? "half" : false,
    hasTorahReading: isChag || isMajorFast || isRoshChodesh || isMinorFast,
    fastStartsAtDawn: isMinorFast,
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
  // Normalize to UTC noon using local date components so HDate (which uses UTC
  // internally) lands on the same Gregorian calendar date regardless of timezone.
  const normalized = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0),
  );
  const hdate = new HDate(normalized);

  // Use HebrewCalendar.calendar() so sedrot (parsha) and omer events are included.
  // getHolidaysOnDate() does not return ParshaEvent or OmerEvent.
  const events = HebrewCalendar.calendar({
    start: hdate,
    end: hdate,
    sedrot: true,
    omer: true,
    il: false,
  });

  const hebrewDate = buildHebrewDate(hdate);
  const isShabbos = hdate.getDay() === 6;
  const isFriday = hdate.getDay() === 5;

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

  // Candle lighting: Friday (for Shabbos) or any day that has a Yom Tov starting.
  // YOM_TOV_ENDS on an event means the Yom Tov ends tonight (havdalah).
  // EREV flag indicates the evening starts a new sanctity — candle lighting applies.
  const hasErevYomTov = events.some((e) => e.getFlags() & flags.EREV);
  const candleLighting = isFriday || hasErevYomTov;

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
