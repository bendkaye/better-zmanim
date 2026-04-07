import { Hono } from "hono";
import type { Env } from "../index";
import { computeZmanim } from "../lib/compute";

export const zmanimRoutes = new Hono<{ Bindings: Env }>();

zmanimRoutes.get("/", async (c) => {
  const lat = c.req.query("lat");
  const lng = c.req.query("lng");
  const date = c.req.query("date");
  const elevation = c.req.query("elevation");

  if (!lat || !lng) {
    return c.json(
      { data: null, error: "lat and lng query parameters are required" },
      400,
    );
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  if (isNaN(latitude) || isNaN(longitude)) {
    return c.json(
      { data: null, error: "lat and lng must be valid numbers" },
      400,
    );
  }

  const parsedDate = date ? new Date(date) : new Date();
  const parsedElevation = elevation ? parseFloat(elevation) : undefined;

  const zmanim = computeZmanim({
    latitude,
    longitude,
    date: parsedDate,
    elevation: parsedElevation,
  });

  return c.json({ data: zmanim, error: null });
});
