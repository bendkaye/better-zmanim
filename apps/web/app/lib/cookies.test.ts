import { describe, it, expect } from "vitest";
import { parseCookies, serializeCookie } from "./cookies";

describe("parseCookies", () => {
  it("parses a cookie header string", () => {
    const result = parseCookies("lang=en; location=new-york");
    expect(result).toEqual({ lang: "en", location: "new-york" });
  });
  it("returns empty object for empty string", () => {
    expect(parseCookies("")).toEqual({});
  });
  it("handles values with equals signs", () => {
    const result = parseCookies("token=abc=def");
    expect(result).toEqual({ token: "abc=def" });
  });
});

describe("serializeCookie", () => {
  it("serializes a cookie with defaults", () => {
    const cookie = serializeCookie("lang", "en");
    expect(cookie).toContain("lang=en");
    expect(cookie).toContain("Path=/");
    expect(cookie).toContain("SameSite=Lax");
  });
  it("serializes with max age", () => {
    const cookie = serializeCookie("lang", "he", { maxAge: 86400 });
    expect(cookie).toContain("Max-Age=86400");
  });
});
