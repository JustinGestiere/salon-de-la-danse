import { describe, expect, it } from "vitest";

import {
  findGaugeShortage,
  getGaugeUsage,
  getSeatAvailability,
  isDiscountCapReached,
} from "@/features/tickets/quotas";

describe("getGaugeUsage", () => {
  it("counts passes in the Salon gauge and options in their own gauges", () => {
    const usage = getGaugeUsage({ discoveryPass: 2, passionPass: 1, openingEvening: 3, masterclassSession: 4 });
    expect(usage).toEqual({ salon: 3, openingEvening: 3, masterclass: 4 });
  });
});

describe("findGaugeShortage", () => {
  it("returns null when every gauge has room", () => {
    const shortage = findGaugeShortage({ salon: 2, openingEvening: 0, masterclass: 1 }, { salon: 100, openingEvening: 0, masterclass: 0 });
    expect(shortage).toBeNull();
  });

  it("reports the masterclass gauge when its 800 sessions are almost gone", () => {
    const shortage = findGaugeShortage({ salon: 1, openingEvening: 0, masterclass: 3 }, { salon: 0, openingEvening: 0, masterclass: 798 });
    expect(shortage).toEqual({ gauge: "masterclass", seatsLeft: 2 });
  });
});

describe("getSeatAvailability", () => {
  it("flags the last seats under ten percent of the capacity", () => {
    expect(getSeatAvailability(6300, 5800)).toEqual({ capacity: 6300, seatsLeft: 500, isLow: true, isSoldOut: false });
  });

  it("never reports negative seats when sales overshoot the capacity", () => {
    expect(getSeatAvailability(6300, 6310)).toEqual({ capacity: 6300, seatsLeft: 0, isLow: false, isSoldOut: true });
  });
});

describe("isDiscountCapReached", () => {
  it("keeps promo codes available under 8 percent of gross revenue", () => {
    expect(isDiscountCapReached({ grossInCents: 100_000, discountInCents: 7_999 })).toBe(false);
  });

  it("blocks promo codes once discounts reach 8 percent of gross revenue", () => {
    expect(isDiscountCapReached({ grossInCents: 100_000, discountInCents: 8_000 })).toBe(true);
  });

  it("keeps promo codes available before the first sale", () => {
    expect(isDiscountCapReached({ grossInCents: 0, discountInCents: 0 })).toBe(false);
  });
});
