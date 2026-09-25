import { describe, expect, it } from "vitest";

import { isNavItemActive } from "@/components/layout/navigation";

describe("isNavItemActive", () => {
  it("marks the exact page as active", () => {
    expect(isNavItemActive("/programme", "/programme")).toBe(true);
  });

  it("keeps a section active on its sub pages", () => {
    expect(isNavItemActive("/billetterie/merci", "/billetterie")).toBe(true);
  });

  it("does not match a page that only shares a prefix", () => {
    expect(isNavItemActive("/invites-2026", "/invites")).toBe(false);
  });
});
