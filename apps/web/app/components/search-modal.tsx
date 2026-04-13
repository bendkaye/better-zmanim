import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { createApiClient } from "@better-zmanim/shared";
import type { Language, Location } from "@better-zmanim/shared";
import { toSlug } from "../lib/slug";
import { serializeCookie } from "../lib/cookies";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  apiBaseUrl: string;
}

export function SearchModal({
  isOpen,
  onClose,
  lang,
  apiBaseUrl,
}: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Location[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();

  const api = createApiClient({ baseUrl: apiBaseUrl });

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  const handleSearch = useCallback(
    (value: string) => {
      setQuery(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (value.trim().length < 2) {
        setResults([]);
        return;
      }

      debounceRef.current = setTimeout(async () => {
        setIsSearching(true);
        const response = await api.getGeocode({ q: value.trim() });
        if (response.data) {
          setResults(response.data.results);
        }
        setIsSearching(false);
      }, 300);
    },
    [api],
  );

  const handleSelect = useCallback(
    (location: Location) => {
      const slug = toSlug(location.name);
      document.cookie = serializeCookie("lastLocation", slug, {
        maxAge: 365 * 24 * 60 * 60,
        path: "/",
      });
      onClose();
      navigate(`/location/${slug}`);
    },
    [navigate, onClose],
  );

  const handleUseMyLocation = useCallback(() => {
    if (!navigator.geolocation) return;

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const response = await api.getGeocode({
          q: `${position.coords.latitude},${position.coords.longitude}`,
        });
        const firstResult = response.data?.results[0];
        if (firstResult) {
          handleSelect(firstResult);
        }
        setGeoLoading(false);
      },
      () => {
        setGeoLoading(false);
      },
    );
  }, [api, handleSelect]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  if (!isOpen) return null;

  const placeholder =
    lang === "he" ? "חפש עיר או כתובת..." : "Search city or address...";
  const useLocationLabel = lang === "he" ? "השתמש במיקום שלי" : "Use my location";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 pt-0 sm:items-center sm:pt-0"
      onClick={handleOverlayClick}
    >
      <div className="h-full w-full bg-apple-black sm:h-auto sm:max-w-[520px] sm:rounded-[12px] sm:shadow-card">
        <div className="p-4">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-[11px] border-[3px] border-white/5 bg-white/10 px-4 py-3 text-[17px] text-white placeholder:text-white/40 focus:border-apple-blue focus:outline-none"
          />

          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={geoLoading}
            className="mt-3 w-full rounded-[8px] bg-apple-blue px-4 py-2.5 text-[15px] font-medium text-white disabled:opacity-50"
          >
            {geoLoading ? "..." : useLocationLabel}
          </button>
        </div>

        {isSearching && (
          <div className="px-4 pb-4 text-center text-[13px] text-white/40">
            {lang === "he" ? "מחפש..." : "Searching..."}
          </div>
        )}

        {results.length > 0 && (
          <div className="max-h-[60vh] overflow-y-auto px-2 pb-4">
            {results.map((location, index) => (
              <button
                key={`${location.lat}-${location.lng}-${index}`}
                type="button"
                onClick={() => handleSelect(location)}
                className="w-full px-4 py-3 text-start text-[15px] text-white hover:bg-white/10"
              >
                <span className="block">{location.name}</span>
                <span className="text-[12px] text-white/40">
                  {location.timeZone}
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="p-4 sm:hidden">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-[980px] border border-white/20 py-2.5 text-[15px] text-white/60"
          >
            {lang === "he" ? "ביטול" : "Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}
