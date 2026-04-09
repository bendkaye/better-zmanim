// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useZmanim } from "./use-zmanim";

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch);
  mockFetch.mockReset();
});

describe("useZmanim", () => {
  it("starts in loading state", () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: null, error: null }),
    });

    const { result } = renderHook(() =>
      useZmanim({ lat: 40.71, lng: -74.01, baseUrl: "https://api.test" }),
    );
    expect(result.current.loading).toBe(true);
  });

  it("returns data on success", async () => {
    const mockData = {
      location: { lat: 40.71, lng: -74.01, name: "", timeZone: "UTC" },
      date: "2026-04-09",
      dayInfo: {
        hebrewDate: {},
        isShabbos: false,
        holidays: [],
        parsha: null,
        omerDay: null,
        candleLighting: false,
        havdalah: false,
      },
      zmanim: [],
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockData, error: null }),
    });

    const { result } = renderHook(() =>
      useZmanim({ lat: 40.71, lng: -74.01, baseUrl: "https://api.test" }),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it("returns error on failure", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: null,
        error: { code: "INVALID_LOCATION", message: "Bad" },
      }),
    });

    const { result } = renderHook(() =>
      useZmanim({ lat: 999, lng: 999, baseUrl: "https://api.test" }),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBeNull();
    expect(result.current.error?.code).toBe("INVALID_LOCATION");
  });

  it("handles network error", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network failed"));

    const { result } = renderHook(() =>
      useZmanim({ lat: 40.71, lng: -74.01, baseUrl: "https://api.test" }),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error?.code).toBe("NETWORK_ERROR");
  });
});
