import { getZmanLabel, formatZmanTime } from "@better-zmanim/shared";
import type { ZmanTimeResult, Language } from "@better-zmanim/shared";

interface ZmanRowProps {
  zman: ZmanTimeResult;
  lang: Language;
  isPast: boolean;
  isNext: boolean;
  variant: "light" | "dark";
}

const OPINION_PATTERN = /^(.+?)\s*\((.+)\)$/;

export function ZmanRow({ zman, lang, isPast, isNext, variant }: ZmanRowProps) {
  const rawLabel =
    getZmanLabel(zman.zmanId, zman.opinionId, lang) ?? zman.zmanId;
  const match = OPINION_PATTERN.exec(rawLabel);
  const name = match ? match[1] : rawLabel;
  const opinion = match ? match[2] : null;

  const formattedTime = formatZmanTime(zman.time);

  const baseText =
    variant === "light" ? "text-apple-text" : "text-white";
  const dimmedText = "opacity-25";
  const nextText = "text-apple-blue-bright font-semibold";

  const textClass = isPast
    ? `${baseText} ${dimmedText}`
    : isNext
      ? nextText
      : baseText;

  return (
    <div
      className={`flex min-h-[44px] items-center justify-between px-4 ${textClass}`}
    >
      <span className="text-[15px]">
        {name}
        {opinion ? (
          <span className="ms-1.5 text-[11px] opacity-50">{opinion}</span>
        ) : null}
      </span>
      <time
        dateTime={zman.time ?? undefined}
        className="text-[15px] tabular-nums"
      >
        {formattedTime}
      </time>
    </div>
  );
}
