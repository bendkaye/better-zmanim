import { useCallback } from "react";
import { useNavigate } from "react-router";
import { serializeCookie } from "../lib/cookies";

interface NavProps {
  locationName: string;
  lang: string;
  onSearchOpen: () => void;
}

const LANG_CYCLE: Record<string, { next: string; label: string }> = {
  en: { next: "he", label: "עב" },
  he: { next: "translit", label: "Tr" },
  translit: { next: "en", label: "En" },
};

export function Nav({ locationName, lang, onSearchOpen }: NavProps) {
  const navigate = useNavigate();

  const handleLangToggle = useCallback(() => {
    const nextLang = LANG_CYCLE[lang]?.next ?? "en";
    document.cookie = serializeCookie("lang", nextLang, {
      maxAge: 365 * 24 * 60 * 60,
      path: "/",
    });
    document.documentElement.lang = nextLang === "he" ? "he" : "en";
    document.documentElement.dir = nextLang === "he" ? "rtl" : "ltr";
    navigate(".", { replace: true });
  }, [lang, navigate]);

  const toggleLabel = LANG_CYCLE[lang]?.label ?? "En";

  return (
    <nav className="sticky top-0 z-50 h-[48px] bg-black/80 backdrop-blur-[20px] backdrop-saturate-[180%]">
      <div className="mx-auto flex h-full max-w-[980px] items-center justify-between px-4">
        <span className="font-display text-[16px] font-semibold text-white">
          Better Zmanim
        </span>

        <button
          type="button"
          onClick={onSearchOpen}
          className="max-w-[200px] truncate text-[12px] text-white/80"
        >
          {locationName}
        </button>

        <button
          type="button"
          onClick={handleLangToggle}
          className="rounded-[980px] border border-apple-blue-bright px-3 py-0.5 text-[12px] text-apple-blue-bright"
        >
          {toggleLabel}
        </button>
      </div>
    </nav>
  );
}
