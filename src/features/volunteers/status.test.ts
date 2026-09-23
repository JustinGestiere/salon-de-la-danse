import { describe, expect, it } from "vitest";

import {
  computeAgeOn,
  computeMinorBirthDateCutoff,
  deriveVolunteerStatus,
  isMinorOn,
} from "@/features/volunteers/status";

const EVENT_START = new Date("2027-05-14T06:30:00Z");

describe("computeAgeOn", () => {
  it("counts a birthday falling on the reference day", () => {
    expect(computeAgeOn(new Date("2009-05-14"), EVENT_START)).toBe(18);
  });

  it("does not count a birthday falling the day after", () => {
    expect(computeAgeOn(new Date("2009-05-15"), EVENT_START)).toBe(17);
  });
});

describe("isMinorOn", () => {
  it("flags a volunteer who turns 18 after the event starts", () => {
    expect(isMinorOn(new Date("2009-06-01"), EVENT_START)).toBe(true);
  });

  it("does not flag an adult", () => {
    expect(isMinorOn(new Date("1990-01-01"), EVENT_START)).toBe(false);
  });
});

describe("computeMinorBirthDateCutoff", () => {
  it("returns the reference date eighteen years earlier", () => {
    expect(computeMinorBirthDateCutoff(EVENT_START).toISOString()).toBe("2009-05-14T06:30:00.000Z");
  });
});

describe("deriveVolunteerStatus", () => {
  it("reports a locked planning as locked whatever its content", () => {
    expect(deriveVolunteerStatus("LOCKED", 0)).toBe("locked");
  });

  it("reports a draft without slot as empty", () => {
    expect(deriveVolunteerStatus("DRAFT", 0)).toBe("empty");
  });

  it("reports a draft with slots as draft", () => {
    expect(deriveVolunteerStatus("DRAFT", 2)).toBe("draft");
  });
});
