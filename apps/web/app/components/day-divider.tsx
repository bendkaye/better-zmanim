import type { DayInfo, Language } from "@better-zmanim/shared";

interface DayDividerProps {
  dayInfo: DayInfo;
  gregorianDate: string;
  lang: Language;
  variant: "light" | "dark";
}

export function DayDivider({
  dayInfo,
  gregorianDate,
  lang,
  variant,
}: DayDividerProps) {
  const hebrewDateDisplay =
    lang === "he"
      ? dayInfo.hebrewDate.displayHebrew
      : dayInfo.hebrewDate.displayEnglish;

  const firstHoliday =
    dayInfo.holidays.length > 0 ? dayInfo.holidays[0] : null;
  const holidayName = firstHoliday
    ? (firstHoliday.names[lang] ?? firstHoliday.names.en)
    : null;

  const bgClass = variant === "light" ? "bg-apple-gray" : "bg-apple-black";
  const headingColor = variant === "light" ? "text-apple-text" : "text-white";
  const subColor =
    variant === "light" ? "text-apple-text/50" : "text-white/50";

  const subtitle = holidayName
    ? `${gregorianDate} \u00B7 ${holidayName}`
    : gregorianDate;

  return (
    <div className={`${bgClass} px-4 pb-4 pt-8 text-center`}>
      <h2
        className={`font-display text-[24px] font-semibold leading-tight ${headingColor}`}
      >
        {hebrewDateDisplay}
      </h2>
      <p className={`mt-1 text-[14px] font-light ${subColor}`}>{subtitle}</p>
    </div>
  );
}
