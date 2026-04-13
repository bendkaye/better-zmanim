import { Link } from "react-router";
import type { Language } from "@better-zmanim/shared";

interface FooterProps {
  lang: Language;
  currentSlug?: string;
}

const POPULAR_LOCATIONS = [
  { slug: "jerusalem-israel", en: "Jerusalem", he: "ירושלים" },
  { slug: "new-york-ny", en: "New York", he: "ניו יורק" },
  { slug: "los-angeles-ca", en: "Los Angeles", he: "לוס אנג'לס" },
  { slug: "london-uk", en: "London", he: "לונדון" },
  { slug: "tel-aviv-israel", en: "Tel Aviv", he: "תל אביב" },
  { slug: "chicago-il", en: "Chicago", he: "שיקגו" },
  { slug: "miami-fl", en: "Miami", he: "מיאמי" },
  { slug: "toronto-canada", en: "Toronto", he: "טורונטו" },
];

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
