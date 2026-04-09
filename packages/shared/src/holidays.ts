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
