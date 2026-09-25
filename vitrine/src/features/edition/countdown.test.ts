import { describe, expect, it } from "vitest";

import { getDaysUntil } from "@/features/edition/countdown";

describe("getDaysUntil", () => {
  it("counts calendar days until the opening", () => {
    expect(getDaysUntil("2027-05-14", new Date("2026-09-24T10:00:00Z"))).toBe(232);
  });

  it("uses the Angers date late in the evening, not the UTC date", () => {
    // 21 h 30 UTC, soit 23 h 30 à Angers : on est encore le 13 mai.
    expect(getDaysUntil("2027-05-14", new Date("2027-05-13T21:30:00Z"))).toBe(1);
  });

  it("switches day at midnight in Angers", () => {
    expect(getDaysUntil("2027-05-14", new Date("2027-05-13T22:30:00Z"))).toBe(0);
  });

  it("never goes below zero once the date has passed", () => {
    expect(getDaysUntil("2027-05-14", new Date("2027-06-01T10:00:00Z"))).toBe(0);
  });
});
