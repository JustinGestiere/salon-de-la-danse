import { describe, expect, it } from "vitest";

import { getCheckoutSessionExpiry } from "@/features/tickets/checkout-expiry";

const STRIPE_MIN_SECONDS = 30 * 60;
const STRIPE_MAX_SECONDS = 24 * 60 * 60;

describe("getCheckoutSessionExpiry", () => {
  it("stays within the 30 minutes to 24 hours window Stripe accepts, with a margin for network delay", () => {
    const realNow = new Date("2026-09-25T09:23:00Z");
    const nowInSeconds = realNow.getTime() / 1000;

    const expiry = getCheckoutSessionExpiry(realNow);

    expect(expiry - nowInSeconds).toBeGreaterThan(STRIPE_MIN_SECONDS);
    expect(expiry - nowInSeconds).toBeLessThan(STRIPE_MAX_SECONDS);
  });
});
