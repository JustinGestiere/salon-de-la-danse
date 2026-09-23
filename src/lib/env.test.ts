import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const VALID_ENV = {
  DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/salon_de_la_danse",
  BETTER_AUTH_SECRET: "q3VtLr8k2PzN9yXcW4bHs7aEf6Jd1Gm0TuRiOoKlYnA=",
  BETTER_AUTH_URL: "http://localhost:3000",
  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
  UPLOAD_DIR: "./storage/photos",
};

async function loadEnvWith(overrides: Partial<typeof VALID_ENV>): Promise<unknown> {
  for (const [name, value] of Object.entries({ ...VALID_ENV, ...overrides })) {
    vi.stubEnv(name, value);
  }
  vi.resetModules();
  return import("./env");
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("env", () => {
  it("accepts a randomly generated secret", async () => {
    await expect(loadEnvWith({})).resolves.toBeDefined();
  });

  it("refuses to start with the placeholder secret from .env.example", async () => {
    await expect(
      loadEnvWith({ BETTER_AUTH_SECRET: "change-me-in-production" }),
    ).rejects.toThrow("BETTER_AUTH_SECRET");
  });

  it("refuses a secret shorter than 32 characters", async () => {
    await expect(loadEnvWith({ BETTER_AUTH_SECRET: "a".repeat(31) })).rejects.toThrow(
      "BETTER_AUTH_SECRET",
    );
  });
});
