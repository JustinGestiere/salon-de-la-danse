import { describe, expect, it } from "vitest";

import { computeRegistrationTimeline } from "@/features/editions/timeline";

describe("computeRegistrationTimeline", () => {
  it("places the earliest point at the left margin and the latest at the right margin", () => {
    const timeline = computeRegistrationTimeline({
      now: new Date("2027-01-01T00:00:00Z"),
      opensAt: new Date("2027-02-01T00:00:00Z"),
      closesAt: new Date("2027-04-01T00:00:00Z"),
      eventStart: new Date("2027-05-14T06:30:00Z"),
    });

    expect(timeline.todayPercent).toBe(6);
    expect(timeline.eventPercent).toBe(94);
  });

  it("keeps the points in chronological order", () => {
    const timeline = computeRegistrationTimeline({
      now: new Date("2027-03-01T00:00:00Z"),
      opensAt: new Date("2027-02-01T00:00:00Z"),
      closesAt: new Date("2027-04-01T00:00:00Z"),
      eventStart: new Date("2027-05-14T06:30:00Z"),
    });

    expect(timeline.opensPercent).toBeLessThan(timeline.todayPercent);
    expect(timeline.todayPercent).toBeLessThan(timeline.closesPercent);
  });

  it("falls back to the closing date when the grid does not exist yet", () => {
    const timeline = computeRegistrationTimeline({
      now: new Date("2027-01-01T00:00:00Z"),
      opensAt: new Date("2027-01-01T00:00:00Z"),
      closesAt: new Date("2027-04-01T00:00:00Z"),
      eventStart: null,
    });

    expect(timeline.eventPercent).toBe(timeline.closesPercent);
  });
});
