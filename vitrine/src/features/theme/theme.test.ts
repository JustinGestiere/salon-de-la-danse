import { describe, expect, it } from "vitest";

import { getNextSiteTheme, parseSiteTheme } from "@/features/theme/theme";

describe("parseSiteTheme", () => {
  it("keeps a known theme", () => {
    expect(parseSiteTheme("dark")).toBe("dark");
  });

  it("falls back to system for an unknown cookie value", () => {
    expect(parseSiteTheme("neon")).toBe("system");
  });

  it("falls back to system when the cookie is missing", () => {
    expect(parseSiteTheme(undefined)).toBe("system");
  });
});

describe("getNextSiteTheme", () => {
  it("cycles from dark back to system", () => {
    expect(getNextSiteTheme("dark")).toBe("system");
  });

  it("goes from system to light", () => {
    expect(getNextSiteTheme("system")).toBe("light");
  });
});
