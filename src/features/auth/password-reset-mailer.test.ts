import { describe, expect, it, vi } from "vitest";

const sendMail = vi.hoisted(() => vi.fn());

vi.mock("server-only", () => ({}));
vi.mock("@/lib/env", () => ({ env: { NEXT_PUBLIC_APP_URL: "http://localhost:3000" } }));
vi.mock("@/lib/mailer", () => ({ sendMail }));

const { sendPasswordResetEmail } = await import("./password-reset-mailer");

describe("sendPasswordResetEmail", () => {
  it("does not fail when the mail server refuses the message", async () => {
    sendMail.mockRejectedValueOnce(new Error("SMTP 550"));
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    await expect(
      sendPasswordResetEmail({ userId: "user-1", email: "marie@example.org", token: "abc123" }),
    ).resolves.toBeUndefined();
    expect(consoleError).toHaveBeenCalled();

    consoleError.mockRestore();
  });
});
