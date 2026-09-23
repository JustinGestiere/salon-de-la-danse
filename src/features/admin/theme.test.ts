import { describe, expect, it } from "vitest";

import { getNextAdminTheme, parseAdminTheme } from "@/features/admin/theme";

describe("parseAdminTheme", () => {
  it("keeps a known theme", () => {
    expect(parseAdminTheme("dark")).toBe("dark");
  });

  it("falls back to system for an unknown cookie value", () => {
    expect(parseAdminTheme("neon")).toBe("system");
  });

  it("falls back to system when the cookie is missing", () => {
    expect(parseAdminTheme(undefined)).toBe("system");
  });
});

describe("getNextAdminTheme", () => {
  it("cycles from dark back to system", () => {
    expect(getNextAdminTheme("dark")).toBe("system");
  });

  it("goes from system to light", () => {
    expect(getNextAdminTheme("system")).toBe("light");
  });
});
