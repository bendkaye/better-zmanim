import type { ApiResponse } from "./types";

interface ApiClientConfig {
  baseUrl: string;
}

interface FetchZmanimParams {
  lat: number;
  lng: number;
  date?: string;
  elevation?: number;
}

export function createApiClient(config: ApiClientConfig) {
  async function fetchJson<T>(path: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${config.baseUrl}${path}`);
    return (await response.json()) as ApiResponse<T>;
  }

  return {
    getZmanim(params: FetchZmanimParams) {
      const searchParams = new URLSearchParams({
        lat: params.lat.toString(),
        lng: params.lng.toString(),
      });
      if (params.date) searchParams.set("date", params.date);
      if (params.elevation !== undefined) {
        searchParams.set("elevation", params.elevation.toString());
      }
      return fetchJson(`/api/zmanim?${searchParams.toString()}`);
    },

    getHealth() {
      return fetchJson<{ status: string }>("/api/health");
    },
  };
}
