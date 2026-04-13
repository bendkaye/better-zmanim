import type { ZmanimResponse, GeocodeResponse } from "@better-zmanim/shared";

interface ApiResponse<T> {
  data: T | null;
  error: { code: string; message: string } | null;
}

export async function fetchZmanim(
  api: Fetcher,
  params: {
    lat: number;
    lng: number;
    date?: string;
    tz?: string;
    candleLightingOffset?: number;
  },
): Promise<ApiResponse<ZmanimResponse>> {
  const searchParams = new URLSearchParams({
    lat: params.lat.toString(),
    lng: params.lng.toString(),
  });
  if (params.date) searchParams.set("date", params.date);
  if (params.tz) searchParams.set("tz", params.tz);
  if (params.candleLightingOffset !== undefined) {
    searchParams.set("candleLightingOffset", params.candleLightingOffset.toString());
  }
  const response = await api.fetch(
    new Request(`https://api/api/zmanim?${searchParams.toString()}`),
  );
  return response.json() as Promise<ApiResponse<ZmanimResponse>>;
}

export async function fetchGeocode(
  api: Fetcher,
  query: string,
): Promise<ApiResponse<GeocodeResponse>> {
  const searchParams = new URLSearchParams({ q: query });
  const response = await api.fetch(
    new Request(`https://api/api/geocode?${searchParams.toString()}`),
  );
  return response.json() as Promise<ApiResponse<GeocodeResponse>>;
}
