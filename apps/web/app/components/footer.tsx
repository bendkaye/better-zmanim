import { Link } from "react-router";
import type { Language } from "@better-zmanim/shared";
import { POPULAR_LOCATIONS } from "../lib/popular-locations";

interface FooterProps {
  lang: Language;
  currentSlug?: string;
}

export function Footer({ lang, currentSlug }: FooterProps) {
  const locations = POPULAR_LOCATIONS.filter((l) => l.slug !== currentSlug);
  const header =
    lang === "he" ? "זמנים בערים נוספות" : "Zmanim in other cities";

  return (
    <footer className="bg-apple-black px-4 pb-12 pt-10">
      <div className="mx-auto max-w-[980px]">
        <h3 className="text-[14px] font-semibold text-white/60">{header}</h3>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
          {locations.map((loc) => (
            <Link
              key={loc.slug}
              to={`/location/${loc.slug}`}
              className="text-[14px] text-apple-blue-bright hover:underline"
            >
              {lang === "he" ? loc.he : loc.en}
            </Link>
          ))}
        </div>
        <p className="mt-10 text-center text-[12px] text-white/30">
          Better Zmanim
        </p>
      </div>
    </footer>
  );
}
