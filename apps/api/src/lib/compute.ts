import { ComplexZmanimCalendar, GeoLocation } from "kosher-zmanim";
import momentTimezone from "moment-timezone";

export interface ComputeZmanimInput {
  latitude: number;
  longitude: number;
  date: Date;
  elevation?: number;
}

export interface ZmanimResult {
  alos: string | null;
  misheyakir: string | null;
  hanetz: string | null;
  sofZmanShmaGra: string | null;
  sofZmanShmaMga: string | null;
  sofZmanTefilaGra: string | null;
  sofZmanTefilaMga: string | null;
  chatzos: string | null;
  minchaGedola: string | null;
  minchaKetana: string | null;
  plagHamincha: string | null;
  shkia: string | null;
  tzeisGeonim: string | null;
  tzeis72: string | null;
}

function formatTime(date: Date | null): string | null {
  if (!date) return null;
  return date.toISOString();
}

export function computeZmanim(input: ComputeZmanimInput): ZmanimResult {
  const { latitude, longitude, date, elevation } = input;

  const geoLocation = new GeoLocation(
    "location",
    latitude,
    longitude,
    elevation ?? 0,
  );

  const calendar = new ComplexZmanimCalendar(geoLocation);
  calendar.setMoment(momentTimezone(date));

  return {
    alos: formatTime(calendar.getAlos72()),
    misheyakir: formatTime(calendar.getMisheyakir10Point2Degrees()),
    hanetz: formatTime(calendar.getSunrise()),
    sofZmanShmaGra: formatTime(calendar.getSofZmanShmaGRA()),
    sofZmanShmaMga: formatTime(calendar.getSofZmanShmaMGA()),
    sofZmanTefilaGra: formatTime(calendar.getSofZmanTfilaGRA()),
    sofZmanTefilaMga: formatTime(calendar.getSofZmanTfilaMGA()),
    chatzos: formatTime(calendar.getChatzos()),
    minchaGedola: formatTime(calendar.getMinchaGedola()),
    minchaKetana: formatTime(calendar.getMinchaKetana()),
    plagHamincha: formatTime(calendar.getPlagHamincha()),
    shkia: formatTime(calendar.getSunset()),
    tzeisGeonim: formatTime(calendar.getTzaisGeonim8Point5Degrees()),
    tzeis72: formatTime(calendar.getTzais72()),
  };
}
