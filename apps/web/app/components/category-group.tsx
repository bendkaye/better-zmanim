import type { ZmanTimeResult, Language } from "@better-zmanim/shared";
import { ZmanRow } from "./zman-row";

interface CategoryGroupProps {
  label: string;
  zmanim: ZmanTimeResult[];
  lang: Language;
  now: Date;
  nextZmanId: string | null;
  variant: "light" | "dark";
}

const CATEGORY_LABELS: Record<string, Record<string, string>> = {
  morning: { en: "Morning", he: "בוקר", translit: "Morning" },
  afternoon: {
    en: "Afternoon",
    he: "אחר הצהריים",
    translit: "Afternoon",
  },
  evening: { en: "Evening", he: "ערב", translit: "Evening" },
};

export function CategoryGroup({
  label,
  zmanim,
  lang,
  now,
  nextZmanId,
  variant,
}: CategoryGroupProps) {
  const displayLabel =
    CATEGORY_LABELS[label]?.[lang] ?? CATEGORY_LABELS[label]?.en ?? label;

  const headerColor =
    variant === "light" ? "text-apple-text/35" : "text-white/35";

  return (
    <div className="mt-4">
      <h3
        className={`px-4 text-[11px] font-semibold uppercase tracking-[0.8px] ${headerColor}`}
      >
        {displayLabel}
      </h3>
      <div className="mt-1">
        {zmanim.map((z) => {
          const isPast =
            z.time !== null && new Date(z.time).getTime() <= now.getTime();
          const isNext =
            nextZmanId !== null &&
            z.zmanId === nextZmanId.split(":")[0] &&
            z.opinionId === nextZmanId.split(":")[1];
          return (
            <ZmanRow
              key={`${z.zmanId}-${z.opinionId}`}
              zman={z}
              lang={lang}
              isPast={isPast}
              isNext={isNext}
              variant={variant}
            />
          );
        })}
      </div>
    </div>
  );
}
