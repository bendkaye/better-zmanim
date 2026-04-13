import type { Language } from "@better-zmanim/shared";

export function formatGregorianDate(dateStr: string, lang: Language): string {
  const date = new Date(dateStr + "T00:00:00");
  const locale = lang === "he" ? "he-IL" : "en-US";
  return date.toLocaleDateString(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
