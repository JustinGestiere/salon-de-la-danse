import { describe, expect, it } from "vitest";

import { checkoutInputSchema, checkoutSessionIdSchema } from "@/features/tickets/schemas";

const EMPTY_QUANTITIES = {
  discoveryPass: 0,
  passionPass: 0,
  reducedDayPass: 0,
  openingEvening: 0,
  masterclassSession: 0,
};

describe("checkoutInputSchema", () => {
  it("accepts an order with at least one ticket and the terms accepted", () => {
    const result = checkoutInputSchema.safeParse({
      quantities: { ...EMPTY_QUANTITIES, discoveryPass: 1 },
      acceptsTermsOfSale: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty order", () => {
    const result = checkoutInputSchema.safeParse({ quantities: EMPTY_QUANTITIES, acceptsTermsOfSale: true });
    expect(result.success).toBe(false);
  });

  it("rejects an order without the terms of sale", () => {
    const result = checkoutInputSchema.safeParse({
      quantities: { ...EMPTY_QUANTITIES, discoveryPass: 1 },
      acceptsTermsOfSale: false,
    });
    expect(result.success).toBe(false);
  });

  it("rejects more than ten tickets of the same type", () => {
    const result = checkoutInputSchema.safeParse({
      quantities: { ...EMPTY_QUANTITIES, discoveryPass: 11 },
      acceptsTermsOfSale: true,
    });
    expect(result.success).toBe(false);
  });

  it("strips a price sent by the browser", () => {
    const result = checkoutInputSchema.safeParse({
      quantities: { ...EMPTY_QUANTITIES, discoveryPass: 1 },
      acceptsTermsOfSale: true,
      unitPriceInCents: 1,
    });

    expect(result.success).toBe(true);
    expect(result.data).not.toHaveProperty("unitPriceInCents");
  });
});

describe("checkoutInputSchema access code", () => {
  it("trims the private sale access code", () => {
    const result = checkoutInputSchema.safeParse({
      quantities: { ...EMPTY_QUANTITIES, discoveryPass: 1 },
      acceptsTermsOfSale: true,
      accessCode: "  ECOLE2027  ",
    });
    expect(result.success && result.data.accessCode).toBe("ECOLE2027");
  });
});

describe("checkoutSessionIdSchema", () => {
  it("accepts a Stripe test session id", () => {
    expect(checkoutSessionIdSchema.safeParse("cs_test_a1B2c3").success).toBe(true);
  });

  it("rejects anything else", () => {
    expect(checkoutSessionIdSchema.safeParse("../../admin").success).toBe(false);
  });
});
