import { describe, expect, it, vi } from "vitest";

import { PASSWORD_RESET_MAX_ATTEMPTS } from "@/features/auth/constants";

const requestPasswordReset = vi.hoisted(() => vi.fn(async () => undefined));

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "x-forwarded-for": "198.51.100.23" }),
}));
vi.mock("@/features/auth/password-reset-service", () => ({
  requestPasswordReset,
  resetPassword: vi.fn(),
}));

const { requestPasswordResetAction } = await import("./password-reset-actions");

describe("requestPasswordResetAction", () => {
  it("stops sending links to a client that keeps asking", async () => {
    for (let attempt = 0; attempt < PASSWORD_RESET_MAX_ATTEMPTS; attempt += 1) {
      const result = await requestPasswordResetAction({ email: "marie@example.org" });
      expect(result).toEqual({ ok: true, data: undefined });
    }

    const blocked = await requestPasswordResetAction({ email: "marie@example.org" });

    expect(blocked).toMatchObject({ ok: false, error: { code: "rateLimit.exceeded" } });
    expect(requestPasswordReset).toHaveBeenCalledTimes(PASSWORD_RESET_MAX_ATTEMPTS);
  });
});
