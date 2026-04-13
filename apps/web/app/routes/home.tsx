import { useState } from "react";
import { data } from "react-router";
import type { Route } from "./+types/home";
import type { Language, ZmanimResponse } from "@better-zmanim/shared";
import { fetchZmanim } from "../lib/api.server";
import { parseCookies } from "../lib/cookies";
import { formatGregorianDate } from "../lib/date-helpers";
import { findNextZman } from "../lib/zmanim-helpers";
import { buildMeta, buildJsonLd } from "../components/seo-meta";
import { Nav } from "../components/nav";
import { Hero } from "../components/hero";
import { ZmanimDay } from "../components/zmanim-day";
import { InfiniteScroll } from "../components/infinite-scroll";
import { SearchModal } from "../components/search-modal";
import { Footer } from "../components/footer";

interface CfProperties {
  latitude?: string;
  longitude?: string;
  city?: string;
  timezone?: string;
}

export async function loader({ request, context }: Route.LoaderArgs) {
  const cloudflare = context.cloudflare as { env: { API: Fetcher } };
  const api = cloudflare.env.API;

  const cookieHeader = request.headers.get("Cookie") ?? "";
  const cookies = parseCookies(cookieHeader);
  const lang = (cookies.lang ?? "en") as Language;

  const cfProps = (request as unknown as { cf?: CfProperties }).cf ?? {};
  const lat = cfProps.latitude ? parseFloat(cfProps.latitude) : 40.7128;
  const lng = cfProps.longitude ? parseFloat(cfProps.longitude) : -74.006;
  const city = cfProps.city ?? "New York";
  const tz = cfProps.timezone ?? "America/New_York";

  const url = new URL(request.url);
  const dateParam = url.searchParams.get("date") ?? undefined;

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
  const gregorianDate = formatGregorianDate(zmanimResponse.date, lang);

  return data({
    locationName: city,
    lang,
    lat,
    lng,
    tz,
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

  const { locationName, lang, lat, lng, tz, gregorianDate, zmanimResponse } =
    loaderData as {
      locationName: string;
      lang: Language;
      lat: number;
      lng: number;
      tz: string;
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
          lat={lat}
          lng={lng}
          tz={tz}
          lang={lang}
        />
      </main>
      <Footer lang={lang} />
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        lang={lang}
      />
    </>
  );
}
