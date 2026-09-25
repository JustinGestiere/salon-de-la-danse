import { describe, expect, it } from "vitest";

import { TICKET_TYPES } from "@/features/tickets/content";
import {
  buildOrderLines,
  getOnSitePriceInCents,
  getOrderTotalInCents,
  getSaleStatus,
  type TicketQuantities,
} from "@/features/tickets/pricing";

const NO_TICKETS: TicketQuantities = {
  discoveryPass: 0,
  passionPass: 0,
  reducedDayPass: 0,
  openingEvening: 0,
  masterclassSession: 0,
};

function getPhaseId(isoDate: string): string {
  const status = getSaleStatus(new Date(isoDate));
  if (status.kind === "open") return status.phase.id;
  if (status.kind === "upcoming") return `upcoming:${status.nextPhase.id}`;
  return status.kind;
}

describe("getSaleStatus", () => {
  it("announces the private sale before it opens", () => {
    expect(getPhaseId("2026-09-25T10:00:00Z")).toBe("upcoming:privateSale");
  });

  it("opens the private sale at midnight in Angers on February 14 (J-90)", () => {
    const status = getSaleStatus(new Date("2027-02-13T23:00:00Z"));
    expect(status).toMatchObject({ kind: "open", phase: { id: "privateSale", isPrivate: true } });
  });

  it("closes online sales between the private sale and J-45", () => {
    expect(getPhaseId("2027-03-01T10:00:00Z")).toBe("upcoming:earlyBird");
  });

  it("opens the public early bird on March 31 (J-45)", () => {
    expect(getPhaseId("2027-03-30T22:00:00Z")).toBe("earlyBird");
  });

  it("switches to full price on April 15 (J-30)", () => {
    expect(getPhaseId("2027-04-14T22:00:00Z")).toBe("fullPrice");
  });

  it("ends online sales once the Salon opens to the public", () => {
    expect(getPhaseId("2027-05-15T07:00:00Z")).toBe("ended");
  });
});

describe("buildOrderLines", () => {
  it("prices each ticket type with the phase tier and skips empty ones", () => {
    const lines = buildOrderLines({ ...NO_TICKETS, discoveryPass: 2, masterclassSession: 1 }, "earlyBird");

    expect(lines).toEqual([
      { ticketTypeId: "discoveryPass", label: "Pass Découverte, 1 jour", quantity: 2, unitPriceInCents: 1400, totalInCents: 2800 },
      { ticketTypeId: "masterclassSession", label: "Option masterclass", quantity: 1, unitPriceInCents: 1500, totalInCents: 1500 },
    ]);
  });
});

describe("getOrderTotalInCents", () => {
  it("adds up every line at full price", () => {
    const lines = buildOrderLines({ ...NO_TICKETS, passionPass: 1, reducedDayPass: 2 }, "fullPrice");
    expect(getOrderTotalInCents(lines)).toBe(3200 + 2 * 1300);
  });
});

describe("getOnSitePriceInCents", () => {
  it("adds the 2 euro box office surcharge to the full price", () => {
    const discoveryPass = TICKET_TYPES.find((ticketType) => ticketType.id === "discoveryPass");
    expect(discoveryPass && getOnSitePriceInCents(discoveryPass)).toBe(2000);
  });
});
