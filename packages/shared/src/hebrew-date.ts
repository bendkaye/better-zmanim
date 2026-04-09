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
