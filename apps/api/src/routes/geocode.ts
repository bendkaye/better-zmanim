// apps/api/src/routes/geocode.ts
import { Hono } from "hono";
import type { Env } from "../index";
import {
  API_ERROR_CODES,
  GEOCODE_CACHE_TTL_SECONDS,
} from "@better-zmanim/shared";
import type { Location } from "@better-zmanim/shared";
import { logger } from "../lib/logger";

export const geocodeRoutes = new Hono<{ Bindings: Env }>();

geocodeRoutes.get("/", async (c) => {
  const q = c.req.query("q");

  if (!q || !q.trim()) {
    return c.json(
      {
        data: null,
        error: {
          code: API_ERROR_CODES.geocodeFailed,
          message: "q parameter is required",
        },
      },
      400,
    );
  }

  const cacheKey = `geocode:${q.toLowerCase().trim()}`;

  // Check KV cache
  const cached = await c.env.GEOCODE_CACHE.get(cacheKey, "json");
  if (cached) {
    return c.json({ data: { results: cached as Location[] }, error: null });
  }

  // Fetch from Nominatim
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5`;
    const response = await fetch(url, {
      headers: { "User-Agent": "BetterZmanim/1.0" },
    });

    if (!response.ok) {
      return c.json(
        {
          data: null,
          error: {
            code: API_ERROR_CODES.geocodeFailed,
            message: "Geocoding service error",
          },
        },
        502,
      );
    }

    const raw = (await response.json()) as Array<{
      lat: string;
      lon: string;
      display_name: string;
    }>;

    const results: Location[] = raw.map((item) => ({
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      name: item.display_name,
      timeZone: "UTC",
    }));

    // Cache in KV with 30-day TTL
    await c.env.GEOCODE_CACHE.put(cacheKey, JSON.stringify(results), {
      expirationTtl: GEOCODE_CACHE_TTL_SECONDS,
    });

    return c.json({ data: { results }, error: null });
  } catch (error) {
    logger.error("geocode failed", {
      error: error instanceof Error ? error.message : String(error),
      query: q,
    });
    return c.json(
      {
        data: null,
        error: {
          code: API_ERROR_CODES.geocodeFailed,
          message: "Geocoding request failed",
        },
      },
      502,
    );
  }
});
