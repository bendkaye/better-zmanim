// apps/api/src/lib/compute.ts
import { ComplexZmanimCalendar, GeoLocation } from "kosher-zmanim";
import momentTimezone from "moment-timezone";
import { ZMANIM } from "@better-zmanim/shared";
import type { ZmanId, ZmanTimeResult } from "@better-zmanim/shared";

export interface ComputeInput {
  latitude: number;
  longitude: number;
  date: Date;
  elevation?: number;
  timeZone?: string;
  candleLightingOffset?: number;
}

export function computeAllZmanim(input: ComputeInput): ZmanTimeResult[] {
  const {
    latitude,
    longitude,
    date,
    elevation,
    timeZone,
    candleLightingOffset,
  } = input;

  const geoLocation = new GeoLocation(
    "location",
    latitude,
    longitude,
    elevation ?? 0,
    timeZone ?? "UTC",
  );

  const calendar = new ComplexZmanimCalendar(geoLocation);
  calendar.setMoment(momentTimezone(date));
  calendar.setCandleLightingOffset(candleLightingOffset ?? 18);

  const results: ZmanTimeResult[] = [];

  for (const zmanId of Object.keys(ZMANIM) as ZmanId[]) {
    const zman = ZMANIM[zmanId];
    for (const [opinionId, opinion] of Object.entries(zman.opinions)) {
      const methodName = (opinion as { kosherZmanimMethod: string })
        .kosherZmanimMethod;
      const method = calendar[methodName as keyof ComplexZmanimCalendar];

      let time: string | null = null;
      if (typeof method === "function") {
        const result = (method as () => Date | null).call(calendar);
        time = result ? result.toISOString() : null;
      }

      results.push({ zmanId, opinionId, time });
    }
  }

  return results;
}
