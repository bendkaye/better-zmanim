import { useCallback, useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";
import type { ZmanimResponse, Language } from "@better-zmanim/shared";
import { DayDivider } from "./day-divider";
import { ZmanimDay } from "./zmanim-day";

interface InfiniteScrollProps {
  initialDate: string;
  lat: number;
  lng: number;
  tz: string;
  lang: Language;
}

interface FutureDay {
  date: string;
  zmanimResponse: ZmanimResponse;
}

function addDays(dateStr: string, n: number): string {
  const date = new Date(dateStr + "T00:00:00");
  date.setDate(date.getDate() + n);
  return date.toISOString().slice(0, 10);
}

function formatDayDate(dateStr: string, lang: Language): string {
  const date = new Date(dateStr + "T00:00:00");
  const locale = lang === "he" ? "he-IL" : "en-US";
  return date.toLocaleDateString(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function InfiniteScroll({
  initialDate,
  lat,
  lng,
  tz,
  lang,
}: InfiniteScrollProps) {
  const [futureDays, setFutureDays] = useState<FutureDay[]>([]);
  const [nextDate, setNextDate] = useState(() => addDays(initialDate, 1));
  const [isLoading, setIsLoading] = useState(false);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const fetcher = useFetcher<{ zmanimResponse: ZmanimResponse }>();

  useEffect(() => {
    const zmanimResponse = fetcher.data?.zmanimResponse;
    if (zmanimResponse && fetcher.state === "idle" && isLoading) {
      setFutureDays((prev) => [
        ...prev,
        {
          date: addDays(nextDate, -1),
          zmanimResponse,
        },
      ]);
      setNextDate((prev) => addDays(prev, 1));
      setIsLoading(false);
    }
  }, [fetcher.data, fetcher.state, isLoading, nextDate]);

  const loadNext = useCallback(() => {
    if (fetcher.state !== "idle" || isLoading) return;
    setIsLoading(true);
    fetcher.load(
      `/api/zmanim?lat=${lat}&lng=${lng}&tz=${encodeURIComponent(tz)}&date=${nextDate}`,
    );
  }, [fetcher, lat, lng, tz, nextDate, isLoading]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadNext();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadNext]);

  return (
    <div>
      {futureDays.map((day, index) => {
        const variant = (index + 1) % 2 === 0 ? "light" : "dark";
        return (
          <div key={day.date}>
            <DayDivider
              dayInfo={day.zmanimResponse.dayInfo}
              gregorianDate={formatDayDate(day.date, lang)}
              lang={lang}
              variant={variant}
            />
            <ZmanimDay
              zmanimResponse={day.zmanimResponse}
              lang={lang}
              variant={variant}
              isToday={false}
            />
          </div>
        );
      })}

      <div ref={sentinelRef} className="h-1">
        {fetcher.state === "loading" && (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-pulse rounded-full bg-white/20" />
          </div>
        )}
      </div>
    </div>
  );
}
