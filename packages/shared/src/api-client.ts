import type { ApiResponse } from "./api";
import type { ZmanimResponse, GeocodeResponse, HebDateResponse } from "./api";

interface ApiClientConfig {
  baseUrl: string;
}

interface FetchZmanimParams {
  lat: number;
  lng: number;
  date?: string;
  elevation?: number;
}

interface FetchGeocodeParams {
  q: string;
}

interface FetchHebDateParams {
  date?: string;
}

export function createApiClient(config: ApiClientConfig) {
  async function fetchJson<T>(path: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${config.baseUrl}${path}`);
      return (await response.json()) as ApiResponse<T>;
    } catch (error) {
      return {
        data: null,
        error: {
          code: "NETWORK_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
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
      return fetchJson<ZmanimResponse>(
        `/api/zmanim?${searchParams.toString()}`,
      );
    },

    getGeocode(params: FetchGeocodeParams) {
      const searchParams = new URLSearchParams({ q: params.q });
      return fetchJson<GeocodeResponse>(
        `/api/geocode?${searchParams.toString()}`,
      );
    },

    getHebDate(params: FetchHebDateParams) {
      if (params.date) {
        const searchParams = new URLSearchParams({ date: params.date });
        return fetchJson<HebDateResponse>(
          `/api/hebdate?${searchParams.toString()}`,
        );
      }
      return fetchJson<HebDateResponse>("/api/hebdate");
    },

    getHealth() {
      return fetchJson<{ status: string; version: string }>("/api/health");
    },
  };
}
