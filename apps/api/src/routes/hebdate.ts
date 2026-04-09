import { Hono } from "hono";
import type { Env } from "../index";
import { buildDayInfo, API_ERROR_CODES } from "@better-zmanim/shared";
import type { HebDateResponse } from "@better-zmanim/shared";

export const hebdateRoutes = new Hono<{ Bindings: Env }>();

hebdateRoutes.get("/", async (c) => {
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

  const dayInfo = buildDayInfo(date);
  const response: HebDateResponse = { dayInfo };

  return c.json({ data: response, error: null });
});
