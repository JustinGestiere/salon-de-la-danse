import { beforeEach, describe, expect, it, vi } from "vitest";
import { APIError } from "better-auth/api";

const fake = vi.hoisted(() => ({
  isMailerConfigured: vi.fn(() => true),
  requestPasswordReset: vi.fn(async () => ({ status: true })),
  resetPassword: vi.fn(async () => ({ status: true })),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/mailer", () => ({ isMailerConfigured: fake.isMailerConfigured }));
vi.mock("@/lib/auth", () => ({
  auth: {
    api: { requestPasswordReset: fake.requestPasswordReset, resetPassword: fake.resetPassword },
  },
}));

const { requestPasswordReset, resetPassword } = await import("./password-reset-service");

const VALID_RESET = { token: "abc123", password: "NouveauMotDePasse1", confirmPassword: "NouveauMotDePasse1" };

beforeEach(() => {
  vi.clearAllMocks();
  fake.isMailerConfigured.mockReturnValue(true);
});

describe("requestPasswordReset", () => {
  it("rejects the request when no mail server is configured", async () => {
    fake.isMailerConfigured.mockReturnValue(false);

    await expect(requestPasswordReset("marie@example.org")).rejects.toMatchObject({
      code: "mail.unavailable",
    });
    expect(fake.requestPasswordReset).not.toHaveBeenCalled();
  });

  it("asks Better Auth to send the link to the given address", async () => {
    await requestPasswordReset("marie@example.org");

    expect(fake.requestPasswordReset).toHaveBeenCalledWith({ body: { email: "marie@example.org" } });
  });
});

describe("resetPassword", () => {
  it("reports an expired or already used link as a business error", async () => {
    fake.resetPassword.mockRejectedValueOnce(
      APIError.from("BAD_REQUEST", { code: "INVALID_TOKEN", message: "Invalid token" }),
    );

    await expect(resetPassword(VALID_RESET)).rejects.toMatchObject({ code: "auth.invalidResetToken" });
  });

  it("saves the new password with the token from the link", async () => {
    await resetPassword(VALID_RESET);

    expect(fake.resetPassword).toHaveBeenCalledWith({
      body: { token: "abc123", newPassword: "NouveauMotDePasse1" },
    });
  });
});
