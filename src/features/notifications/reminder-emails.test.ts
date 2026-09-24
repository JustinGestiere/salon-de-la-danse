import { describe, expect, it } from "vitest";

import { buildDraftPlanningReminder, buildMissingPhotoReminder } from "./reminder-emails";

const BASE = {
  to: "marie@example.org",
  firstName: "Marie",
  editionName: "Salon 2027",
  appUrl: "https://salon.example",
};

describe("buildDraftPlanningReminder", () => {
  it("reminds the registration deadline and links to the planning", () => {
    const email = buildDraftPlanningReminder({ ...BASE, closesAt: new Date("2027-04-30T16:00:00Z") });

    expect(email.text).toContain("30 avril 2027");
    expect(email.html).toContain('href="https://salon.example/planning"');
  });
});

describe("buildMissingPhotoReminder", () => {
  it("tells the volunteer where to send the photo", () => {
    const email = buildMissingPhotoReminder({ ...BASE, contactEmail: "equipe@salon.example" });

    expect(email.text).toContain("equipe@salon.example");
  });
});
