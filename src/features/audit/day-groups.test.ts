import { describe, expect, it } from "vitest";

import { groupByEventDay } from "@/features/audit/day-groups";

const NOW = new Date("2027-05-15T10:00:00Z");

describe("groupByEventDay", () => {
  it("labels today and yesterday and keeps the input order", () => {
    const groups = groupByEventDay(
      [
        { id: "a", createdAt: new Date("2027-05-15T08:00:00Z") },
        { id: "b", createdAt: new Date("2027-05-14T18:00:00Z") },
        { id: "c", createdAt: new Date("2027-05-12T09:00:00Z") },
      ],
      NOW,
    );

    expect(groups.map((group) => group.label)).toEqual(["Aujourd'hui", "Hier", "mercredi 12 mai"]);
  });

  it("uses the Paris day, not the UTC day", () => {
    // 22h30 UTC le 14 mai, c'est déjà le 15 mai à Paris (UTC+2).
    const groups = groupByEventDay([{ id: "a", createdAt: new Date("2027-05-14T22:30:00Z") }], NOW);

    expect(groups[0]?.label).toBe("Aujourd'hui");
  });
});
