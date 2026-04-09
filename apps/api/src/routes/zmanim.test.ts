// apps/api/src/routes/zmanim.test.ts
import { describe, it, expect } from "vitest";
import app from "../index";

describe("GET /api/zmanim", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- test helper
  async function request(
    query: string,
  ): Promise<{ status: number; body: any }> {
    const res = await app.request(`/api/zmanim?${query}`);
    const body = await res.json();
    return { status: res.status, body };
  }

  describe("validation", () => {
    it("returns 400 when lat is missing", async () => {
      const { status, body } = await request("lng=-74.01");
      expect(status).toBe(400);
      expect(body.error.code).toBe("INVALID_LOCATION");
    });

    it("returns 400 when lng is missing", async () => {
      const { status, body } = await request("lat=40.71");
      expect(status).toBe(400);
      expect(body.error.code).toBe("INVALID_LOCATION");
    });

    it("returns 400 for non-numeric lat", async () => {
      const { status, body } = await request("lat=abc&lng=-74.01");
      expect(status).toBe(400);
      expect(body.error.code).toBe("INVALID_LOCATION");
    });

    it("returns 400 for out-of-range lat", async () => {
      const { status, body } = await request("lat=999&lng=-74.01");
      expect(status).toBe(400);
      expect(body.error.code).toBe("INVALID_LOCATION");
    });

    it("returns 400 for out-of-range lng", async () => {
      const { status, body } = await request("lat=40.71&lng=999");
      expect(status).toBe(400);
      expect(body.error.code).toBe("INVALID_LOCATION");
    });

    it("returns 400 for invalid date", async () => {
      const { status, body } = await request(
        "lat=40.71&lng=-74.01&date=not-a-date",
      );
      expect(status).toBe(400);
      expect(body.error.code).toBe("INVALID_DATE");
    });
  });

  describe("success", () => {
    it("returns 200 with valid lat/lng", async () => {
      const { status, body } = await request("lat=40.71&lng=-74.01");
      expect(status).toBe(200);
      expect(body.data).not.toBeNull();
      expect(body.error).toBeNull();
    });

    it("response has ZmanimResponse shape", async () => {
      const { body } = await request("lat=31.77&lng=35.21&date=2026-04-09");
      expect(body.data.location).toBeDefined();
      expect(body.data.location.lat).toBe(31.77);
      expect(body.data.location.lng).toBe(35.21);
      expect(body.data.date).toBe("2026-04-09");
      expect(body.data.dayInfo).toBeDefined();
      expect(body.data.dayInfo.hebrewDate).toBeDefined();
      expect(Array.isArray(body.data.zmanim)).toBe(true);
      expect(body.data.zmanim.length).toBeGreaterThan(0);
    });

    it("each zman result has zmanId, opinionId, time", async () => {
      const { body } = await request("lat=40.71&lng=-74.01&date=2026-04-09");
      for (const zman of body.data.zmanim) {
        expect(zman).toHaveProperty("zmanId");
        expect(zman).toHaveProperty("opinionId");
        expect(zman).toHaveProperty("time");
      }
    });

    it("accepts optional elevation", async () => {
      const { status, body } = await request(
        "lat=31.77&lng=35.21&date=2026-04-09&elevation=800",
      );
      expect(status).toBe(200);
      expect(body.data.location.elevation).toBe(800);
    });

    it("accepts optional tz", async () => {
      const { body } = await request(
        "lat=31.77&lng=35.21&date=2026-04-09&tz=Asia/Jerusalem",
      );
      expect(body.data.location.timeZone).toBe("Asia/Jerusalem");
    });

    it("defaults tz to UTC", async () => {
      const { body } = await request("lat=31.77&lng=35.21&date=2026-04-09");
      expect(body.data.location.timeZone).toBe("UTC");
    });

    it("accepts optional candleLightingOffset", async () => {
      const { status } = await request(
        "lat=31.77&lng=35.21&date=2026-04-09&candleLightingOffset=20",
      );
      expect(status).toBe(200);
    });
  });
});
