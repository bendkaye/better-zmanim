import { useState, useEffect } from "react";
import { createApiClient } from "../api-client";
import type { ZmanimResponse, ApiError } from "../types";

interface UseZmanimParams {
  lat: number;
  lng: number;
  date?: string;
  elevation?: number;
  baseUrl: string;
}

interface UseZmanimResult {
  data: ZmanimResponse | null;
  error: ApiError | null;
  loading: boolean;
}

export function useZmanim(params: UseZmanimParams): UseZmanimResult {
  const [data, setData] = useState<ZmanimResponse | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const client = createApiClient({ baseUrl: params.baseUrl });
    client
      .getZmanim({
        lat: params.lat,
        lng: params.lng,
        date: params.date,
        elevation: params.elevation,
      })
      .then((response) => {
        if (cancelled) return;
        setData(response.data as ZmanimResponse | null);
        setError(response.error);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError({
          code: "NETWORK_ERROR",
          message: err instanceof Error ? err.message : "Unknown error",
        });
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [params.lat, params.lng, params.date, params.elevation, params.baseUrl]);

  return { data, error, loading };
}
