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
  "אחד",
  "שני",
  "שלשה",
  "ארבעה",
  "חמשה",
  "ששה",
  "שבעה",
  "שמונה",
  "תשעה",
  "עשרה",
  "אחד עשר",
  "שנים עשר",
  "שלשה עשר",
  "ארבעה עשר",
  "חמשה עשר",
  "ששה עשר",
  "שבעה עשר",
  "שמונה עשר",
  "תשעה עשר",
  "עשרים",
  "עשרים ואחד",
  "עשרים ושנים",
  "עשרים ושלשה",
  "עשרים וארבעה",
  "עשרים וחמשה",
  "עשרים וששה",
  "עשרים ושבעה",
  "עשרים ושמונה",
  "עשרים ותשעה",
  "שלשים",
  "שלשים ואחד",
  "שלשים ושנים",
  "שלשים ושלשה",
  "שלשים וארבעה",
  "שלשים וחמשה",
  "שלשים וששה",
  "שלשים ושבעה",
  "שלשים ושמונה",
  "שלשים ותשעה",
  "ארבעים",
  "ארבעים ואחד",
  "ארבעים ושנים",
  "ארבעים ושלשה",
  "ארבעים וארבעה",
  "ארבעים וחמשה",
  "ארבעים וששה",
  "ארבעים ושבעה",
  "ארבעים ושמונה",
  "ארבעים ותשעה",
] as const;

export function formatOmerCount(
  day: number,
  language: Language,
): string | null {
  if (day < 1 || day > 49) return null;

  if (language === "he") {
    const dayWord = HEBREW_NUMBERS[day];
    if (day === 1) {
      return `היום יום ${dayWord} לעומר`;
    }
    return `היום ${dayWord} ימים לעומר`;
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
