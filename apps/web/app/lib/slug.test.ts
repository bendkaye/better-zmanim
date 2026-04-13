import { describe, it, expect } from "vitest";
import { toSlug, fromSlug } from "./slug";

describe("toSlug", () => {
  it("lowercases and hyphenates spaces", () => {
    expect(toSlug("New York")).toBe("new-york");
  });
  it("strips diacritics", () => {
    expect(toSlug("Montréal")).toBe("montreal");
  });
  it("handles hyphens in original name", () => {
    expect(toSlug("Tel Aviv-Yafo")).toBe("tel-aviv-yafo");
  });
  it("strips non-alphanumeric characters except hyphens", () => {
    expect(toSlug("St. Louis, MO")).toBe("st-louis-mo");
  });
  it("collapses multiple hyphens", () => {
    expect(toSlug("San   Francisco")).toBe("san-francisco");
  });
  it("trims leading/trailing hyphens", () => {
    expect(toSlug(" London ")).toBe("london");
  });
});

describe("fromSlug", () => {
  it("converts slug back to search query", () => {
    expect(fromSlug("new-york")).toBe("new york");
  });
  it("handles single-word slugs", () => {
    expect(fromSlug("jerusalem")).toBe("jerusalem");
  });
});
