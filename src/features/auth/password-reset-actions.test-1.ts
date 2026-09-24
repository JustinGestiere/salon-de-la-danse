import { beforeEach, describe, expect, it, vi } from "vitest";

import { PASSWORD_RESET_MAX_ATTEMPTS } from "@/features/auth/constants";

const requestPasswordReset = vi.hoisted(() => vi.fn(async () => undefined));
// Les limiteurs vivent au niveau du module : chaque test prend sa propre IP
// pour ne pas hériter du quota consommé par le précédent.
const client = vi.hoisted(() => ({ ip: "198.51.100.23" }));

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "x-forwarded-for": client.ip }),
}));
vi.mock("@/features/auth/password-reset-service", () => ({
  requestPasswordReset,
  resetPassword: vi.fn(),
}));

const { requestPasswordResetAction } = await import("./password-reset-actions");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("requestPasswordResetAction", () => {
  it("stops sending links to a client that keeps asking", async () => {
    client.ip = "198.51.100.23";
    for (let attempt = 0; attempt < PASSWORD_RESET_MAX_ATTEMPTS; attempt += 1) {
      const result = await requestPasswordResetAction({ email: `benevole${attempt}@example.org` });
      expect(result).toEqual({ ok: true, data: undefined });
    }

    const blocked = await requestPasswordResetAction({ email: "autre@example.org" });

    expect(blocked).toMatchObject({ ok: false, error: { code: "rateLimit.exceeded" } });
    expect(requestPasswordReset).toHaveBeenCalledTimes(PASSWORD_RESET_MAX_ATTEMPTS);
  });

  it("refuses a second link for the same email within the cooldown", async () => {
    client.ip = "198.51.100.42";
    await requestPasswordResetAction({ email: "marie@example.org" });

    const second = await requestPasswordResetAction({ email: "Marie@Example.org" });

    expect(second).toMatchObject({ ok: false, error: { code: "rateLimit.cooldown" } });
    expect(requestPasswordReset).toHaveBeenCalledOnce();
  });
});
