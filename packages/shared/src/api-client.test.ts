import { describe, it, expect, vi, beforeEach } from "vitest";
import { createApiClient } from "./api-client";

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch);
  mockFetch.mockReset();
});

describe("createApiClient", () => {
  const client = createApiClient({ baseUrl: "https://api.example.com" });

  describe("getZmanim", () => {
    it("constructs correct URL with required params", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: null, error: null }),
      });

      await client.getZmanim({ lat: 40.71, lng: -74.01 });

      const calledUrl = mockFetch.mock.calls[0]?.[0] as string;
      expect(calledUrl).toContain("https://api.example.com/api/zmanim?");
      expect(calledUrl).toContain("lat=40.71");
      expect(calledUrl).toContain("lng=-74.01");
    });

    it("includes optional date and elevation", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: null, error: null }),
      });

      await client.getZmanim({
        lat: 31.77,
        lng: 35.21,
        date: "2026-04-07",
        elevation: 800,
      });

      const calledUrl = mockFetch.mock.calls[0]?.[0] as string;
      expect(calledUrl).toContain("date=2026-04-07");
      expect(calledUrl).toContain("elevation=800");
    });
  });

  describe("getGeocode", () => {
    it("constructs correct URL with query", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { results: [] }, error: null }),
      });

      await client.getGeocode({ q: "Jerusalem" });

      const calledUrl = mockFetch.mock.calls[0]?.[0] as string;
      expect(calledUrl).toBe("https://api.example.com/api/geocode?q=Jerusalem");
    });

    it("encodes special characters in query", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { results: [] }, error: null }),
      });

      await client.getGeocode({ q: "New York, NY" });

      const calledUrl = mockFetch.mock.calls[0]?.[0] as string;
      expect(calledUrl).toContain("q=New+York");
    });
  });

  describe("getHebDate", () => {
    it("constructs URL without date param when omitted", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: null, error: null }),
      });

      await client.getHebDate({});

      const calledUrl = mockFetch.mock.calls[0]?.[0] as string;
      expect(calledUrl).toBe("https://api.example.com/api/hebdate");
    });

    it("includes date param when provided", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: null, error: null }),
      });

      await client.getHebDate({ date: "2026-04-07" });

      const calledUrl = mockFetch.mock.calls[0]?.[0] as string;
      expect(calledUrl).toBe(
        "https://api.example.com/api/hebdate?date=2026-04-07",
      );
    });
  });

  describe("getHealth", () => {
    it("calls the health endpoint", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { status: "ok", version: "1.0.0" },
          error: null,
        }),
      });

      const result = await client.getHealth();

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/api/health",
      );
      expect(result.data?.status).toBe("ok");
    });
  });

  describe("error handling", () => {
    it("returns API error from response body", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: null,
          error: { code: "INVALID_LOCATION", message: "Bad coords" },
        }),
      });

      const result = await client.getZmanim({ lat: 999, lng: 999 });
      expect(result.error?.code).toBe("INVALID_LOCATION");
    });

    it("returns network error when fetch throws", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network failed"));

      const result = await client.getZmanim({ lat: 40, lng: -74 });
      expect(result.data).toBeNull();
      expect(result.error?.code).toBe("NETWORK_ERROR");
    });
  });
});
