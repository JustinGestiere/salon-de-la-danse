import { describe, expect, it } from "vitest";

import { buildPasswordResetEmail, buildPasswordResetUrl } from "./password-reset-email";

describe("buildPasswordResetUrl", () => {
  it("points to the reset page of the app with the token", () => {
    const url = buildPasswordResetUrl("https://benevoles.example.org", "abc123");

    expect(url).toBe("https://benevoles.example.org/reinitialiser-mot-de-passe?token=abc123");
  });
});

describe("buildPasswordResetEmail", () => {
  it("sends the reset link to the requested address", () => {
    const email = buildPasswordResetEmail({
      to: "marie@example.org",
      appUrl: "https://benevoles.example.org",
      token: "abc123",
    });

    expect(email.to).toBe("marie@example.org");
    expect(email.text).toContain("https://benevoles.example.org/reinitialiser-mot-de-passe?token=abc123");
    expect(email.html).toContain('href="https://benevoles.example.org/reinitialiser-mot-de-passe?token=abc123"');
  });
});
