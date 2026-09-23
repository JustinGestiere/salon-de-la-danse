import { describe, expect, it } from "vitest";

import {
  addDaysToIsoDate,
  daysBetween,
  toZonedTimeOfDay,
  utcToZonedLocalInput,
  zonedLocalToUtc,
} from "@/features/editions/dates";

describe("zonedLocalToUtc", () => {
  it("converts a Paris summer time value to UTC", () => {
    expect(zonedLocalToUtc("2027-05-14T08:30").toISOString()).toBe("2027-05-14T06:30:00.000Z");
  });

  it("converts a Paris winter time value to UTC", () => {
    expect(zonedLocalToUtc("2027-01-10T09:00").toISOString()).toBe("2027-01-10T08:00:00.000Z");
  });

  it("rejects a malformed value", () => {
    expect(() => zonedLocalToUtc("14/05/2027 08:30")).toThrow();
  });
});

describe("utcToZonedLocalInput", () => {
  it("round-trips a datetime-local value", () => {
    expect(utcToZonedLocalInput(zonedLocalToUtc("2027-03-01T18:45"))).toBe("2027-03-01T18:45");
  });
});

describe("toZonedTimeOfDay", () => {
  it("returns the Paris wall-clock time", () => {
    expect(toZonedTimeOfDay(new Date("2027-05-14T06:30:00Z"))).toBe("08:30");
  });
});

describe("daysBetween and addDaysToIsoDate", () => {
  it("counts the days between two editions", () => {
    expect(daysBetween("2027-05-14", "2028-05-12")).toBe(364);
  });

  it("shifts a date by a number of days", () => {
    expect(addDaysToIsoDate("2027-05-14", 2)).toBe("2027-05-16");
  });
});
