import { HDate } from "@hebcal/core";

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
