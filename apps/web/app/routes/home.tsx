import { useState } from "react";
import { data } from "react-router";
import type { Route } from "./+types/home";
import type { Language, ZmanimResponse } from "@better-zmanim/shared";
import { fetchZmanim } from "../lib/api.server";
import { parseCookies } from "../lib/cookies";
import { findNextZman } from "../lib/zmanim-helpers";
import { buildMeta, buildJsonLd } from "../components/seo-meta";
import { Nav } from "../components/nav";
import { Hero } from "../components/hero";
import { ZmanimDay } from "../components/zmanim-day";
import { InfiniteScroll } from "../components/infinite-scroll";
import { SearchModal } from "../components/search-modal";
import { Footer } from "../components/footer";

function formatGregorianDate(dateStr: string, lang: Language): string {
  const date = new Date(dateStr + "T00:00:00");
  const locale = lang === "he" ? "he-IL" : "en-US";
  return date.toLocaleDateString(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

interface CfProperties {
  latitude?: string;
  longitude?: string;
  city?: string;
  timezone?: string;
}

export async function loader({ request, context }: Route.LoaderArgs) {
  const api = (context.cloudflare.env as { API: Fetcher }).API;

  const cookieHeader = request.headers.get("Cookie") ?? "";
  const cookies = parseCookies(cookieHeader);
  const lang = (cookies.lang ?? "en") as Language;

  const cf = (request as unknown as { cf?: CfProperties }).cf ?? {};
  const lat = cf.latitude ? parseFloat(cf.latitude) : 40.7128;
  const lng = cf.longitude ? parseFloat(cf.longitude) : -74.006;
  const city = cf.city ?? "New York";
  const tz = cf.timezone ?? "America/New_York";

  const url = new URL(request.url);
  const dateParam = url.searchParams.get("date") ?? undefined;
  const isDataRequest = url.searchParams.has("_data");

  const zmanimResult = await fetchZmanim(api, {
    lat,
    lng,
    date: dateParam,
    tz,
  });

  if (!zmanimResult.data) {
    throw new Response("Failed to fetch zmanim", { status: 502 });
  }

  const zmanimResponse = zmanimResult.data;

  if (isDataRequest) {
    return data({ zmanimResponse });
  }

  const gregorianDate = formatGregorianDate(zmanimResponse.date, lang);

  return data({
    locationName: city,
    lang,
    gregorianDate,
    zmanimResponse,
  });
}

export function meta({ data: loaderData }: Route.MetaArgs) {
  if (!loaderData || !("locationName" in loaderData)) return [];
  const { locationName, zmanimResponse } = loaderData as {
    locationName: string;
    zmanimResponse: ZmanimResponse;
  };
  return buildMeta({ locationName, slug: "", zmanimResponse });
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  if (!("locationName" in loaderData)) {
    return null;
  }

  const { locationName, lang, gregorianDate, zmanimResponse } = loaderData as {
    locationName: string;
    lang: Language;
    gregorianDate: string;
    zmanimResponse: ZmanimResponse;
  };

  const nextZman = findNextZman(zmanimResponse.zmanim, new Date());
  const jsonLd = buildJsonLd({ locationName, slug: "", zmanimResponse });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Nav
        locationName={locationName}
        lang={lang}
        onSearchOpen={() => setSearchOpen(true)}
      />
      <main>
        <Hero
          dayInfo={zmanimResponse.dayInfo}
          gregorianDate={gregorianDate}
          locationName={locationName}
          nextZman={nextZman}
          lang={lang}
        />
        <ZmanimDay
          zmanimResponse={zmanimResponse}
          lang={lang}
          variant="light"
          isToday={true}
        />
        <InfiniteScroll
          initialDate={zmanimResponse.date}
          slug="_home"
          lang={lang}
        />
      </main>
      <Footer lang={lang} />
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        lang={lang}
        apiBaseUrl="/api"
      />
    </>
  );
}
