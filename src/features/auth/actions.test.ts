import { describe, expect, it, vi } from "vitest";

import { REGISTRATION_MAX_ATTEMPTS } from "@/features/auth/constants";

const registerVolunteer = vi.hoisted(() => vi.fn());

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "x-forwarded-for": "203.0.113.7" }),
}));
vi.mock("@/features/auth/service", () => ({ registerVolunteer }));
vi.mock("@/features/notifications/service", () => ({ sendWelcomeEmail: vi.fn() }));

const { registerAction } = await import("./actions");

function buildInvalidRegistration(): FormData {
  const formData = new FormData();
  formData.set("invitationCode", "CODE-AU-HASARD");
  return formData;
}

describe("registerAction", () => {
  it("rejects further attempts from a client that keeps trying codes", async () => {
    for (let attempt = 0; attempt < REGISTRATION_MAX_ATTEMPTS; attempt += 1) {
      const result = await registerAction(buildInvalidRegistration());
      expect(result).toMatchObject({ ok: false, error: { code: "validation" } });
    }

    const blocked = await registerAction(buildInvalidRegistration());

    expect(blocked).toMatchObject({ ok: false, error: { code: "rateLimit.exceeded" } });
    expect(registerVolunteer).not.toHaveBeenCalled();
  });
});
