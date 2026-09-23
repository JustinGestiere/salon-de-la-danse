import { describe, expect, it } from "vitest";

import { getSafeRedirectPath } from "./redirects";

const FALLBACK = "/";

describe("getSafeRedirectPath", () => {
  it("follows an internal path with its query string", () => {
    expect(getSafeRedirectPath("/recapitulatif?day=2027-05-14", FALLBACK)).toBe(
      "/recapitulatif?day=2027-05-14",
    );
  });

  it("falls back when no path is requested", () => {
    expect(getSafeRedirectPath(null, FALLBACK)).toBe(FALLBACK);
  });

  it("rejects an absolute URL to another site", () => {
    expect(getSafeRedirectPath("https://evil.example", FALLBACK)).toBe(FALLBACK);
  });

  it("rejects a protocol-relative URL", () => {
    expect(getSafeRedirectPath("//evil.example/connexion", FALLBACK)).toBe(FALLBACK);
  });

  it("rejects a backslash trick that browsers read as another host", () => {
    expect(getSafeRedirectPath("/\\evil.example", FALLBACK)).toBe(FALLBACK);
  });

  it("rejects a tab hidden between the slashes", () => {
    expect(getSafeRedirectPath("/\t/evil.example", FALLBACK)).toBe(FALLBACK);
  });

  it("rejects a javascript: URL", () => {
    expect(getSafeRedirectPath("javascript:alert(1)", FALLBACK)).toBe(FALLBACK);
  });
});
