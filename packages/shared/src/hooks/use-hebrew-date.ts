import { useState, useEffect } from "react";
import { createApiClient } from "../api-client";
import type { DayInfo, ApiError } from "../types";

interface UseHebrewDateParams {
  date?: string;
  baseUrl: string;
}

interface UseHebrewDateResult {
  data: DayInfo | null;
  error: ApiError | null;
  loading: boolean;
}

export function useHebrewDate(
  params: UseHebrewDateParams,
): UseHebrewDateResult {
  const [data, setData] = useState<DayInfo | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const client = createApiClient({ baseUrl: params.baseUrl });
    client
      .getHebDate({ date: params.date })
      .then((response) => {
        if (cancelled) return;
        if (response.data) {
          setData((response.data as { dayInfo: DayInfo }).dayInfo);
        }
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
  }, [params.date, params.baseUrl]);

  return { data, error, loading };
}
