// apps/api/src/routes/zmanim.ts
import { Hono } from "hono";
import type { Env } from "../index";
import { computeAllZmanim } from "../lib/compute";
import { buildDayInfo, API_ERROR_CODES } from "@better-zmanim/shared";
import type { ZmanimResponse } from "@better-zmanim/shared";
import { logger } from "../lib/logger";

export const zmanimRoutes = new Hono<{ Bindings: Env }>();

zmanimRoutes.get("/", async (c) => {
  const lat = c.req.query("lat");
  const lng = c.req.query("lng");

  if (!lat || !lng) {
    return c.json(
      {
        data: null,
        error: {
          code: API_ERROR_CODES.invalidLocation,
          message: "lat and lng query parameters are required",
        },
      },
      400,
    );
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  if (
    isNaN(latitude) ||
    isNaN(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return c.json(
      {
        data: null,
        error: {
          code: API_ERROR_CODES.invalidLocation,
          message: "lat must be -90..90 and lng must be -180..180",
        },
      },
      400,
    );
  }

  const dateStr = c.req.query("date");
  const date = dateStr ? new Date(dateStr) : new Date();

  if (isNaN(date.getTime())) {
    return c.json(
      {
        data: null,
        error: {
          code: API_ERROR_CODES.invalidDate,
          message: "Invalid date format",
        },
      },
      400,
    );
  }

  const elevation = c.req.query("elevation")
    ? parseFloat(c.req.query("elevation")!)
    : undefined;
  const tz = c.req.query("tz") ?? "UTC";
  const candleLightingOffset = c.req.query("candleLightingOffset")
    ? parseInt(c.req.query("candleLightingOffset")!, 10)
    : 18;

  try {
    const zmanim = computeAllZmanim({
      latitude,
      longitude,
      date,
      elevation,
      timeZone: tz,
      candleLightingOffset,
    });

    const dayInfo = buildDayInfo(date);

    const response: ZmanimResponse = {
      location: {
        lat: latitude,
        lng: longitude,
        elevation,
        name: "",
        timeZone: tz,
      },
      date: date.toISOString().split("T")[0]!,
      dayInfo,
      zmanim,
    };

    return c.json({ data: response, error: null });
  } catch (error) {
    logger.error("zmanim computation failed", {
      error: error instanceof Error ? error.message : String(error),
      lat: latitude,
      lng: longitude,
    });
    return c.json(
      {
        data: null,
        error: {
          code: API_ERROR_CODES.computationFailed,
          message: "Failed to compute zmanim",
        },
      },
      500,
    );
  }
});
