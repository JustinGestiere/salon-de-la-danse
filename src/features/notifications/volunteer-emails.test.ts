import { describe, expect, it } from "vitest";

import {
  buildPlanningConfirmationEmail,
  buildWelcomeEmail,
  groupScheduleByDay,
} from "./volunteer-emails";

const SATURDAY_MORNING = {
  eventDate: "2027-05-15",
  startsAt: new Date("2027-05-15T08:00:00Z"),
  endsAt: new Date("2027-05-15T10:00:00Z"),
  missionName: "Accueil",
  missionLocation: "Hall d'entrée",
};

const SATURDAY_AFTERNOON = {
  eventDate: "2027-05-15",
  startsAt: new Date("2027-05-15T12:00:00Z"),
  endsAt: new Date("2027-05-15T14:00:00Z"),
  missionName: "Vestiaire",
  missionLocation: null,
};

describe("groupScheduleByDay", () => {
  it("puts the slots of the same day under a single heading", () => {
    const sections = groupScheduleByDay([SATURDAY_MORNING, SATURDAY_AFTERNOON]);

    expect(sections).toHaveLength(1);
    expect(sections[0]?.items).toEqual([
      "10:00 – 12:00 · Accueil (Hall d'entrée)",
      "14:00 – 16:00 · Vestiaire",
    ]);
  });
});

describe("buildWelcomeEmail", () => {
  it("sends the new volunteer to the planning page", () => {
    const email = buildWelcomeEmail({
      to: "marie@example.org",
      firstName: "Marie",
      editionName: "Salon 2027",
      appUrl: "https://salon.example",
      eventDays: ["2027-05-14"],
      minSlots: 1,
      maxSlots: 3,
    });

    expect(email.text).toContain("Bonjour Marie,");
    expect(email.text).toContain("entre 1 créneau et 3 créneaux");
    expect(email.html).toContain('href="https://salon.example/planning"');
  });
});

describe("buildPlanningConfirmationEmail", () => {
  it("lists every validated slot in the confirmation", () => {
    const email = buildPlanningConfirmationEmail({
      to: "marie@example.org",
      firstName: "Marie",
      editionName: "Salon 2027",
      appUrl: "https://salon.example",
      schedule: [SATURDAY_MORNING],
    });

    expect(email.text).toContain("10:00 – 12:00 · Accueil (Hall d'entrée)");
    expect(email.html).toContain('href="https://salon.example/recapitulatif"');
  });
});
