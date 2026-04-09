import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hono } from "hono";
import { geocodeRoutes } from "./geocode";

// Mock KV namespace
function createMockKV() {
  const store = new Map<string, string>();
  return {
    get: vi.fn(async (key: string) =>
      store.get(key) ? JSON.parse(store.get(key)!) : null,
    ),
    put: vi.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
    delete: vi.fn(),
    list: vi.fn(),
    getWithMetadata: vi.fn(),
  };
}

function createTestApp(kv: ReturnType<typeof createMockKV>) {
  const app = new Hono<{
    Bindings: { GEOCODE_CACHE: typeof kv; ENVIRONMENT: string };
  }>();
  app.use("*", async (c, next) => {
    // Bind mock env
    c.env = {
      GEOCODE_CACHE: kv as unknown as KVNamespace,
      ENVIRONMENT: "test",
    } as any;
    await next();
  });
  app.route("/api/geocode", geocodeRoutes);
  return app;
}

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch);
  mockFetch.mockReset();
});

describe("GET /api/geocode", () => {
  it("returns 400 when q is missing", async () => {
    const kv = createMockKV();
    const app = createTestApp(kv);
    const res = await app.request("/api/geocode");
    expect(res.status).toBe(400);
    const body = (await res.json()) as any;
    expect(body.error.code).toBe("GEOCODE_FAILED");
  });

  it("returns 400 when q is empty", async () => {
    const kv = createMockKV();
    const app = createTestApp(kv);
    const res = await app.request("/api/geocode?q=");
    expect(res.status).toBe(400);
  });

  it("returns cached results from KV", async () => {
    const kv = createMockKV();
    const cached = [
      { lat: 31.77, lng: 35.21, name: "Jerusalem", timeZone: "UTC" },
    ];
    kv.get.mockResolvedValueOnce(cached);

    const app = createTestApp(kv);
    const res = await app.request("/api/geocode?q=Jerusalem");
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.data.results).toEqual(cached);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("fetches from Nominatim on cache miss", async () => {
    const kv = createMockKV();
    kv.get.mockResolvedValueOnce(null);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { lat: "31.7683", lon: "35.2137", display_name: "Jerusalem, Israel" },
      ],
    });

    const app = createTestApp(kv);
    const res = await app.request("/api/geocode?q=Jerusalem");
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.data.results).toHaveLength(1);
    expect(body.data.results[0].lat).toBe(31.7683);
    expect(body.data.results[0].lng).toBe(35.2137);
    expect(body.data.results[0].name).toBe("Jerusalem, Israel");
  });

  it("caches results in KV after fetch", async () => {
    const kv = createMockKV();
    kv.get.mockResolvedValueOnce(null);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { lat: "40.7128", lon: "-74.006", display_name: "New York" },
      ],
    });

    const app = createTestApp(kv);
    await app.request("/api/geocode?q=New+York");
    expect(kv.put).toHaveBeenCalledTimes(1);
    expect(kv.put.mock.calls[0]?.[0]).toBe("geocode:new york");
  });

  it("returns 502 when Nominatim returns error", async () => {
    const kv = createMockKV();
    kv.get.mockResolvedValueOnce(null);
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

    const app = createTestApp(kv);
    const res = await app.request("/api/geocode?q=test");
    expect(res.status).toBe(502);
  });

  it("returns 502 when fetch throws", async () => {
    const kv = createMockKV();
    kv.get.mockResolvedValueOnce(null);
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const app = createTestApp(kv);
    const res = await app.request("/api/geocode?q=test");
    expect(res.status).toBe(502);
  });
});
