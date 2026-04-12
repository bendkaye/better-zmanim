import { describe, it, expect } from "vitest";
import app from "../index";

describe("GET /api/hebdate", () => {
  async function request(
    query: string = "",
  ): // eslint-disable-next-line @typescript-eslint/no-explicit-any -- test helper
  Promise<{ status: number; body: any }> {
    const url = query ? `/api/hebdate?${query}` : "/api/hebdate";
    const res = await app.request(url);
    const body = await res.json();
    return { status: res.status, body };
  }

  it("returns 200 with no params (defaults to today)", async () => {
    const { status, body } = await request();
    expect(status).toBe(200);
    expect(body.data).not.toBeNull();
    expect(body.data.dayInfo).toBeDefined();
    expect(body.data.dayInfo.hebrewDate).toBeDefined();
  });

  it("returns correct dayInfo for a specific date", async () => {
    const { status, body } = await request("date=2026-04-09");
    expect(status).toBe(200);
    expect(body.data.dayInfo.hebrewDate).toBeDefined();
    expect(body.data.dayInfo.hebrewDate.year).toBe(5786);
  });

  it("returns isShabbos=true for a Saturday", async () => {
    // June 13, 2026 is a Saturday
    const { body } = await request("date=2026-06-13");
    expect(body.data.dayInfo.isShabbos).toBe(true);
  });

  it("returns isShabbos=false for a weekday", async () => {
    // June 11, 2026 is a Thursday
    const { body } = await request("date=2026-06-11");
    expect(body.data.dayInfo.isShabbos).toBe(false);
  });

  it("returns 400 for invalid date", async () => {
    const { status, body } = await request("date=not-a-date");
    expect(status).toBe(400);
    expect(body.error.code).toBe("INVALID_DATE");
  });

  it("includes holidays array", async () => {
    const { body } = await request("date=2026-06-11");
    expect(Array.isArray(body.data.dayInfo.holidays)).toBe(true);
  });

  it("includes omerDay field", async () => {
    const { body } = await request("date=2026-06-11");
    expect(body.data.dayInfo).toHaveProperty("omerDay");
  });
});
