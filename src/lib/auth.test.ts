import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db", () => ({ db: {} }));
vi.mock("@/lib/env", () => ({
  env: {
    BETTER_AUTH_URL: "http://localhost:3000",
    BETTER_AUTH_SECRET: "test-secret-with-enough-entropy-for-vitest",
  },
}));

const { auth } = await import("@/lib/auth");

describe("auth HTTP routes", () => {
  it("rejects a direct sign-up request that bypasses the invitation code", async () => {
    const request = new Request("http://localhost:3000/api/auth/sign-up/email", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "http://localhost:3000" },
      body: JSON.stringify({
        email: "intrus@example.com",
        password: "MotDePasse123",
        name: "Intrus",
        firstName: "In",
        lastName: "Trus",
        phone: "0600000000",
      }),
    });

    const response = await auth.handler(request);

    expect(response.status).toBe(404);
  });

  it("rejects a volunteer editing their own personal information", async () => {
    const request = new Request("http://localhost:3000/api/auth/update-user", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "http://localhost:3000" },
      body: JSON.stringify({ firstName: "Pirate", phone: "0000000000" }),
    });

    const response = await auth.handler(request);

    // 404 et non 401 : la route est coupée avant même la lecture de la session.
    expect(response.status).toBe(404);
  });

  it("rejects a password reset request that bypasses the rate-limited Server Action", async () => {
    const request = new Request("http://localhost:3000/api/auth/request-password-reset", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "http://localhost:3000" },
      body: JSON.stringify({ email: "marie@example.org" }),
    });

    const response = await auth.handler(request);

    expect(response.status).toBe(404);
  });

  it("rejects a new password sent without the registration password rules", async () => {
    const request = new Request("http://localhost:3000/api/auth/reset-password", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "http://localhost:3000" },
      body: JSON.stringify({ token: "abc123", newPassword: "motdepasse" }),
    });

    const response = await auth.handler(request);

    expect(response.status).toBe(404);
  });
});
