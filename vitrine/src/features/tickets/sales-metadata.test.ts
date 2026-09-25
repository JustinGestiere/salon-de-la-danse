import { describe, expect, it } from "vitest";

import { addQuantities, decodeQuantities, encodeQuantities } from "@/features/tickets/sales-metadata";

describe("encodeQuantities", () => {
  it("keeps only the ticket types actually ordered", () => {
    const encoded = encodeQuantities({ discoveryPass: 2, passionPass: 0, reducedDayPass: 0, openingEvening: 0, masterclassSession: 1 });
    expect(encoded).toBe("discoveryPass=2;masterclassSession=1");
  });
});

describe("decodeQuantities", () => {
  it("reads back what encodeQuantities wrote", () => {
    expect(decodeQuantities("discoveryPass=2;masterclassSession=1")).toEqual({ discoveryPass: 2, masterclassSession: 1 });
  });

  it("ignores unknown ticket types and unreadable quantities", () => {
    expect(decodeQuantities("adultOneDay=3;passionPass=abc;reducedDayPass=1")).toEqual({ reducedDayPass: 1 });
  });

  it("returns nothing for a session without metadata", () => {
    expect(decodeQuantities(undefined)).toEqual({});
  });
});

describe("addQuantities", () => {
  it("sums two orders type by type", () => {
    expect(addQuantities({ discoveryPass: 1 }, { discoveryPass: 2, openingEvening: 1 })).toMatchObject({ discoveryPass: 3, openingEvening: 1 });
  });
});
