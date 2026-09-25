import { describe, expect, it } from "vitest";

import { SALE_PERIODS } from "@/features/tickets/content";
import {
  buildOrderLines,
  countSalonSeats,
  getOrderTotalInCents,
  getSalePeriod,
  getSeatAvailability,
  type TicketQuantities,
} from "@/features/tickets/pricing";

const NO_TICKETS: TicketQuantities = {
  adultOneDay: 0,
  adultTwoDays: 0,
  reducedOneDay: 0,
  reducedTwoDays: 0,
  familyOneDay: 0,
  familyTwoDays: 0,
  openingCeremony: 0,
};

describe("getSalePeriod", () => {
  it("applies the early bird price before April 15 in Angers", () => {
    expect(getSalePeriod(new Date("2027-04-14T21:59:00Z")).id).toBe("earlyBird");
  });

  it("switches to presale at midnight in Angers on April 15", () => {
    expect(getSalePeriod(new Date("2027-04-14T22:00:00Z")).id).toBe("presale");
  });

  it("stops online sales once the Salon opens to the public", () => {
    const period = getSalePeriod(new Date("2027-05-15T07:00:00Z"));
    expect(period.id).toBe("onSite");
    expect(period.isSoldOnline).toBe(false);
  });
});

describe("buildOrderLines", () => {
  it("prices each ticket type with the current period and skips empty ones", () => {
    const earlyBird = SALE_PERIODS[0]!;
    const lines = buildOrderLines({ ...NO_TICKETS, adultOneDay: 2, familyTwoDays: 1 }, earlyBird);

    expect(lines).toEqual([
      { ticketTypeId: "adultOneDay", label: "Plein tarif, 1 jour", quantity: 2, unitPriceInCents: 1350, totalInCents: 2700 },
      { ticketTypeId: "familyTwoDays", label: "Pack famille, 2 jours", quantity: 1, unitPriceInCents: 5900, totalInCents: 5900 },
    ]);
  });
});

describe("getOrderTotalInCents", () => {
  it("adds up every line", () => {
    const presale = SALE_PERIODS[1]!;
    const lines = buildOrderLines({ ...NO_TICKETS, reducedOneDay: 3, openingCeremony: 1 }, presale);
    expect(getOrderTotalInCents(lines)).toBe(3 * 1090 + 1900);
  });
});

describe("countSalonSeats", () => {
  it("counts four visitors for a family pack and none for the opening ceremony", () => {
    expect(countSalonSeats({ ...NO_TICKETS, familyOneDay: 1, adultTwoDays: 1, openingCeremony: 2 })).toBe(5);
  });
});

describe("getSeatAvailability", () => {
  it("flags the last seats under ten percent of the capacity", () => {
    expect(getSeatAvailability(2500, 2300)).toEqual({ capacity: 2500, seatsLeft: 200, isLow: true, isSoldOut: false });
  });

  it("never reports negative seats when sales overshoot the capacity", () => {
    expect(getSeatAvailability(2500, 2510)).toEqual({ capacity: 2500, seatsLeft: 0, isLow: false, isSoldOut: true });
  });
});
