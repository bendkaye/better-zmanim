import type { DayInfo, ZmanTimeResult, Language } from "@better-zmanim/shared";
import { Countdown } from "./countdown";

interface HeroProps {
  dayInfo: DayInfo;
  gregorianDate: string;
  locationName: string;
  nextZman: ZmanTimeResult | null;
  lang: Language;
}

export function Hero({
  dayInfo,
  gregorianDate,
  locationName,
  nextZman,
  lang,
}: HeroProps) {
  const hebrewDateDisplay =
    lang === "he"
      ? dayInfo.hebrewDate.displayHebrew
      : dayInfo.hebrewDate.displayEnglish;

  const firstHoliday =
    dayInfo.holidays.length > 0 ? dayInfo.holidays[0] : null;
  const holidayName = firstHoliday
    ? firstHoliday.names[lang] ?? firstHoliday.names.en
    : null;

  return (
    <section className="bg-apple-black px-4 pb-10 pt-8 text-center">
      <p className="text-[14px] font-light text-white/50">
        {gregorianDate} &middot; {locationName}
      </p>

      <h1 className="mx-auto mt-3 max-w-[720px] font-display text-[36px] font-semibold leading-tight tracking-[-0.28px] text-white sm:text-[48px] lg:text-[56px]">
        {hebrewDateDisplay}
      </h1>

      {holidayName ? (
        <p className="mt-2 text-[17px] text-white/60">{holidayName}</p>
      ) : null}

      <Countdown nextZman={nextZman} lang={lang} />
    </section>
  );
}
