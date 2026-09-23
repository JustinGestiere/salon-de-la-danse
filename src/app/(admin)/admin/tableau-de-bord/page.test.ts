import { describe, expect, it, vi } from "vitest";

const { requireAdmin, getActiveEdition } = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  getActiveEdition: vi.fn(),
}));

vi.mock("@/features/admin/guards", () => ({ requireAdmin }));
vi.mock("@/features/admin/queries", () => ({
  getAdminOverview: vi.fn(),
  getFillRates: vi.fn(),
}));
vi.mock("@/features/editions/queries", () => ({
  getActiveEdition,
  isRegistrationOpen: vi.fn(),
}));

const { default: AdminDashboardPage } = await import("./page");

describe("AdminDashboardPage", () => {
  it("refuses a non-administrator before loading any data", async () => {
    const accessDenied = new Error("NEXT_HTTP_ERROR_FALLBACK;404");
    requireAdmin.mockRejectedValue(accessDenied);

    await expect(AdminDashboardPage()).rejects.toBe(accessDenied);
    expect(getActiveEdition).not.toHaveBeenCalled();
  });
});
