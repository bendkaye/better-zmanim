import { useCountdown, getZmanLabel } from "@better-zmanim/shared";
import type { ZmanTimeResult, Language } from "@better-zmanim/shared";

interface CountdownProps {
  nextZman: ZmanTimeResult | null;
  lang: Language;
}

export function Countdown({ nextZman, lang }: CountdownProps) {
  const countdown = useCountdown(nextZman?.time ?? null);

  if (!nextZman || countdown.isExpired) {
    return null;
  }

  const zmanName =
    getZmanLabel(nextZman.zmanId, nextZman.opinionId, lang) ??
    nextZman.zmanId;
  const nextLabel = lang === "he" ? "הבא" : "Next";
  const timePrefix = lang === "he" ? `בעוד ${countdown.label}` : countdown.label;

  return (
    <div className="mt-6 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.8px] text-apple-blue-bright">
        {nextLabel}
      </p>
      <p className="mt-1 font-display text-[19px] font-semibold text-white">
        {zmanName}
      </p>
      <p className="mt-0.5 text-[13px] font-light text-white/60">
        {timePrefix}
      </p>
    </div>
  );
}
