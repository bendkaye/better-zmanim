import { formatZmanTime } from "@better-zmanim/shared";
import type { ZmanimResponse } from "@better-zmanim/shared";

const BASE_URL = "https://better-zmanim.com";

interface SeoInput {
  locationName: string;
  slug: string;
  zmanimResponse: ZmanimResponse;
}

export function buildMeta({ locationName, slug, zmanimResponse }: SeoInput) {
  const { dayInfo, zmanim } = zmanimResponse;
  const hebrewDate = dayInfo.hebrewDate.displayEnglish;
  const year = dayInfo.hebrewDate.year;

  const title = `Zmanim in ${locationName} — ${hebrewDate} ${year} | Better Zmanim`;

  const sunrise = zmanim.find((z) => z.zmanId === "sunrise");
  const sunriseStr = sunrise ? formatZmanTime(sunrise.time) : "";

  const candleLighting = dayInfo.candleLighting
    ? zmanim.find((z) => z.zmanId === "candleLighting")
    : null;
  const sunset = zmanim.find((z) => z.zmanId === "sunset");
  const timeLabel = candleLighting
    ? `Candle Lighting ${formatZmanTime(candleLighting.time)}`
    : sunset
      ? `Sunset ${formatZmanTime(sunset.time)}`
      : "";

  const holiday =
    dayInfo.holidays.length > 0 ? dayInfo.holidays[0].names.en : "";

  const descParts = [
    `Jewish prayer times for ${locationName} today.`,
    sunriseStr ? `Sunrise ${sunriseStr}` : "",
    timeLabel ? `${timeLabel}.` : "",
    holiday ? `${holiday}.` : "",
  ];
  const description = descParts.filter(Boolean).join(" ");

  const canonicalUrl = `${BASE_URL}/location/${slug}`;

  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: canonicalUrl },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { tagName: "link", rel: "canonical", href: canonicalUrl },
  ];
}

export function buildJsonLd({ locationName, slug, zmanimResponse }: SeoInput) {
  const { location, dayInfo, zmanim } = zmanimResponse;
  const canonicalUrl = `${BASE_URL}/location/${slug}`;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `Zmanim in ${locationName}`,
    url: canonicalUrl,
    description: `Jewish prayer times for ${locationName}`,
    about: {
      "@type": "Place",
      name: locationName,
      geo: {
        "@type": "GeoCoordinates",
        latitude: location.lat,
        longitude: location.lng,
      },
    },
  };

  if (dayInfo.candleLighting) {
    const candleLightingZman = zmanim.find(
      (z) => z.zmanId === "candleLighting",
    );
    if (candleLightingZman?.time) {
      const holidayName =
        dayInfo.holidays.length > 0
          ? dayInfo.holidays[0].names.en
          : "Shabbat";

      jsonLd.event = {
        "@type": "Event",
        name: `Candle Lighting for ${holidayName}`,
        startDate: candleLightingZman.time,
        location: {
          "@type": "Place",
          name: locationName,
          geo: {
            "@type": "GeoCoordinates",
            latitude: location.lat,
            longitude: location.lng,
          },
        },
      };
    }
  }

  return jsonLd;
}
