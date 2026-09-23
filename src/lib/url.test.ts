import { describe, expect, it } from "vitest";

import { buildQueryHref, toQueryParams } from "@/lib/url";

describe("buildQueryHref", () => {
  it("keeps current params and applies the patch", () => {
    expect(buildQueryHref("/admin/benevoles", { q: "moreau", page: "2" }, { benevole: "abc" })).toBe(
      "/admin/benevoles?q=moreau&page=2&benevole=abc",
    );
  });

  it("removes a param patched to undefined", () => {
    expect(buildQueryHref("/admin/benevoles", { q: "moreau", page: "2" }, { page: undefined })).toBe(
      "/admin/benevoles?q=moreau",
    );
  });

  it("returns the bare pathname when nothing is left", () => {
    expect(buildQueryHref("/admin/journal", { page: "" })).toBe("/admin/journal");
  });
});

describe("toQueryParams", () => {
  it("keeps the first value of a repeated param", () => {
    expect(toQueryParams({ jour: ["2027-05-14", "2027-05-15"] })).toEqual({ jour: "2027-05-14" });
  });
});
