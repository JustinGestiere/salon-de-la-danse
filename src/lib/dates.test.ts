import { describe, expect, it } from "vitest";

import { toIsoDate } from "./dates";

describe("toIsoDate", () => {
  it("returns the UTC day of a DATE column value", () => {
    expect(toIsoDate(new Date("2027-05-14T00:00:00.000Z"))).toBe("2027-05-14");
  });
});
