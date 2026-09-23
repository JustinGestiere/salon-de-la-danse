import { describe, expect, it } from "vitest";

import { resolveAdminRedirect } from "@/features/admin/navigation";
import { ADMIN_HOME_PATH } from "@/features/auth/redirects";

describe("resolveAdminRedirect", () => {
  it("returns to the back-office page that was requested", () => {
    expect(resolveAdminRedirect("/admin/planning?jour=2027-05-15")).toBe("/admin/planning?jour=2027-05-15");
  });

  it("falls back to the overview without a requested page", () => {
    expect(resolveAdminRedirect(undefined)).toBe(ADMIN_HOME_PATH);
  });

  it("rejects a protocol-relative url pointing to another site", () => {
    expect(resolveAdminRedirect("//exemple.com/admin/")).toBe(ADMIN_HOME_PATH);
  });

  it("rejects a page of the volunteer area", () => {
    expect(resolveAdminRedirect("/tableau-de-bord")).toBe(ADMIN_HOME_PATH);
  });

  it("does not send the admin back to the sign-in page", () => {
    expect(resolveAdminRedirect("/admin/connexion")).toBe(ADMIN_HOME_PATH);
  });
});
