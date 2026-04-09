// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useHebrewDate } from "./use-hebrew-date";

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch);
  mockFetch.mockReset();
});

describe("useHebrewDate", () => {
  it("starts in loading state", () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: null, error: null }),
    });

    const { result } = renderHook(() =>
      useHebrewDate({ baseUrl: "https://api.test" }),
    );
    expect(result.current.loading).toBe(true);
  });

  it("returns dayInfo on success", async () => {
    const mockDayInfo = {
      hebrewDate: { day: 11, month: "nisan", year: 5786 },
      isShabbos: false,
      holidays: [],
      parsha: null,
      omerDay: null,
      candleLighting: false,
      havdalah: false,
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { dayInfo: mockDayInfo }, error: null }),
    });

    const { result } = renderHook(() =>
      useHebrewDate({ date: "2026-04-09", baseUrl: "https://api.test" }),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual(mockDayInfo);
  });

  it("returns error on failure", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: null,
        error: { code: "INVALID_DATE", message: "Bad" },
      }),
    });

    const { result } = renderHook(() =>
      useHebrewDate({ date: "bad", baseUrl: "https://api.test" }),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error?.code).toBe("INVALID_DATE");
  });
});
