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
});
