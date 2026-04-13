import { useState, useEffect } from "react";
import type { ZmanimResponse, Language } from "@better-zmanim/shared";
import {
  groupZmanimByCategory,
  findNextZman,
  countPastZmanim,
} from "../lib/zmanim-helpers";
import { CategoryGroup } from "./category-group";

interface ZmanimDayProps {
  zmanimResponse: ZmanimResponse;
  lang: Language;
  variant: "light" | "dark";
  isToday: boolean;
}

export function ZmanimDay({
  zmanimResponse,
  lang,
  variant,
  isToday,
}: ZmanimDayProps) {
  const [now, setNow] = useState(() => new Date());
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!isToday) return;
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, [isToday]);

  const groups = groupZmanimByCategory(zmanimResponse.zmanim);
  const nextZman = isToday ? findNextZman(zmanimResponse.zmanim, now) : null;
  const pastCount = isToday ? countPastZmanim(zmanimResponse.zmanim, now) : 0;
  const nextZmanKey = nextZman
    ? `${nextZman.zmanId}:${nextZman.opinionId}`
    : null;

  const bgClass = variant === "light" ? "bg-apple-gray" : "bg-apple-black";

  const showCollapse = isToday && pastCount > 0 && !expanded;
  const showExpandButton = isToday && pastCount > 0 && expanded;

  const toggleLabel =
    lang === "he"
      ? expanded
        ? "הסתר \u25B2"
        : `${pastCount} זמנים עברו \u25BC`
      : expanded
        ? "Hide past \u25B2"
        : `${pastCount} past zmanim \u25BC`;

  return (
    <section className={`${bgClass} py-6`}>
      <div className="mx-auto max-w-[980px]">
        {(showCollapse || showExpandButton) && (
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="mb-2 w-full text-center text-[13px] text-apple-blue-bright"
          >
            {toggleLabel}
          </button>
        )}

        {groups.map((group) => {
          const filteredZmanim =
            showCollapse
              ? group.zmanim.filter(
                  (z) =>
                    z.time === null ||
                    new Date(z.time).getTime() > now.getTime(),
                )
              : group.zmanim;

          if (filteredZmanim.length === 0) return null;

          return (
            <CategoryGroup
              key={group.label}
              label={group.label}
              zmanim={filteredZmanim}
              lang={lang}
              now={now}
              nextZmanId={nextZmanKey}
              variant={variant}
            />
          );
        })}
      </div>
    </section>
  );
}
