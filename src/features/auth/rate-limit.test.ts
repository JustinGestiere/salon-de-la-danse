import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { createRateLimiter, getClientIp } = await import("./rate-limit");

const RULE = { maxAttempts: 3, windowMs: 60_000 };
const NOW = 1_000_000;

describe("createRateLimiter", () => {
  it("allows attempts up to the limit", () => {
    const limiter = createRateLimiter(RULE);

    const results = [1, 2, 3].map(() => limiter.tryConsume("1.2.3.4", NOW));

    expect(results).toEqual([true, true, true]);
  });

  it("blocks the attempt that exceeds the limit", () => {
    const limiter = createRateLimiter(RULE);
    [1, 2, 3].forEach(() => limiter.tryConsume("1.2.3.4", NOW));

    expect(limiter.tryConsume("1.2.3.4", NOW + 1)).toBe(false);
  });

  it("allows attempts again once the window has elapsed", () => {
    const limiter = createRateLimiter(RULE);
    [1, 2, 3, 4].forEach(() => limiter.tryConsume("1.2.3.4", NOW));

    expect(limiter.tryConsume("1.2.3.4", NOW + RULE.windowMs)).toBe(true);
  });

  it("counts each client separately", () => {
    const limiter = createRateLimiter(RULE);
    [1, 2, 3, 4].forEach(() => limiter.tryConsume("1.2.3.4", NOW));

    expect(limiter.tryConsume("5.6.7.8", NOW)).toBe(true);
  });
});

describe("getClientIp", () => {
  it("uses the entry added by the closest proxy", () => {
    const headers = new Headers({ "x-forwarded-for": "6.6.6.6, 203.0.113.7" });

    expect(getClientIp(headers)).toBe("203.0.113.7");
  });

  it("falls back to x-real-ip", () => {
    const headers = new Headers({ "x-real-ip": "203.0.113.9" });

    expect(getClientIp(headers)).toBe("203.0.113.9");
  });

  it("groups requests without any address under one key", () => {
    expect(getClientIp(new Headers())).toBe("unknown");
  });
});
