import { useState } from "react";
import { data } from "react-router";
import type { Route } from "./+types/location";
import type { Language, ZmanimResponse } from "@better-zmanim/shared";
import { fetchGeocode, fetchZmanim } from "../lib/api.server";
import { parseCookies } from "../lib/cookies";
import { fromSlug } from "../lib/slug";
import { formatGregorianDate } from "../lib/date-helpers";
import { findNextZman } from "../lib/zmanim-helpers";
import { buildMeta, buildJsonLd } from "../components/seo-meta";
import { Nav } from "../components/nav";
import { Hero } from "../components/hero";
import { ZmanimDay } from "../components/zmanim-day";
import { InfiniteScroll } from "../components/infinite-scroll";
import { SearchModal } from "../components/search-modal";
import { Footer } from "../components/footer";

export async function loader({ params, request, context }: Route.LoaderArgs) {
  const slug = params.slug;
  const cf = context.cloudflare as { env: { API: Fetcher } };
  const api = cf.env.API;

  const cookieHeader = request.headers.get("Cookie") ?? "";
  const cookies = parseCookies(cookieHeader);
  const lang = (cookies.lang ?? "en") as Language;

  const query = fromSlug(slug);
  const geocodeResult = await fetchGeocode(api, query);
  const location = geocodeResult.data?.results[0];

  if (!location) {
    throw new Response("Location not found", { status: 404 });
  }

  const url = new URL(request.url);
  const dateParam = url.searchParams.get("date") ?? undefined;

  const zmanimResult = await fetchZmanim(api, {
    lat: location.lat,
    lng: location.lng,
    date: dateParam,
    tz: location.timeZone,
  });

  if (!zmanimResult.data) {
    throw new Response("Failed to fetch zmanim", { status: 502 });
  }

  const zmanimResponse = zmanimResult.data;
  const gregorianDate = formatGregorianDate(zmanimResponse.date, lang);

  return data({
    slug,
    locationName: location.name,
    lang,
    lat: location.lat,
    lng: location.lng,
    tz: location.timeZone,
    gregorianDate,
    zmanimResponse,
  });
}

export function meta({ data: loaderData }: Route.MetaArgs) {
  if (!loaderData || !("locationName" in loaderData)) return [];
  const { locationName, slug, zmanimResponse } = loaderData as {
    locationName: string;
    slug: string;
    zmanimResponse: ZmanimResponse;
  };
  return buildMeta({ locationName, slug, zmanimResponse });
}

export default function Location({ loaderData }: Route.ComponentProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  const { slug, locationName, lang, lat, lng, tz, gregorianDate, zmanimResponse } =
    loaderData as {
      slug: string;
      locationName: string;
      lang: Language;
      lat: number;
      lng: number;
      tz: string;
      gregorianDate: string;
      zmanimResponse: ZmanimResponse;
    };

  const nextZman = findNextZman(zmanimResponse.zmanim, new Date());
  const jsonLd = buildJsonLd({ locationName, slug, zmanimResponse });

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
      <Footer lang={lang} currentSlug={slug} />
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        lang={lang}
      />
    </>
  );
}
