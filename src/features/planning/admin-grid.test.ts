import { describe, expect, it } from "vitest";

import {
  computeFillRate,
  computeHeatLevel,
  computePublicFillRate,
  countGridAlerts,
} from "@/features/planning/admin-grid";

describe("computeHeatLevel", () => {
  it("marks a slot with no seat left as full", () => {
    expect(computeHeatLevel(6, 6)).toBe("full");
  });

  it("marks an overbooked slot as full", () => {
    expect(computeHeatLevel(7, 6)).toBe("full");
  });

  it("marks a slot with few seats left as tight", () => {
    expect(computeHeatLevel(5, 6)).toBe("tight");
  });

  it("marks a barely filled slot as low", () => {
    expect(computeHeatLevel(1, 6)).toBe("low");
  });

  it("marks a half filled slot as free", () => {
    expect(computeHeatLevel(3, 6)).toBe("free");
  });

  it("treats a zero capacity slot as full", () => {
    expect(computeHeatLevel(0, 0)).toBe("full");
  });
});

describe("computeFillRate", () => {
  it("returns zero when there is no capacity", () => {
    expect(computeFillRate(0, 0)).toBe(0);
  });

  it("rounds to the nearest percent", () => {
    expect(computeFillRate(1, 3)).toBe(33);
  });
});

describe("computePublicFillRate", () => {
  const sensitive = new Set(["cash"]);

  it("ignores sensitive missions and closed slots", () => {
    const cells = [
      { missionId: "welcome", filled: 3, capacity: 6, isOpen: true },
      { missionId: "cash", filled: 0, capacity: 2, isOpen: true },
      { missionId: "welcome", filled: 0, capacity: 6, isOpen: false },
    ];

    expect(computePublicFillRate(cells, sensitive)).toBe(50);
  });

  it("does not count admin overbooking above the capacity", () => {
    const cells = [{ missionId: "welcome", filled: 8, capacity: 6, isOpen: true }];

    expect(computePublicFillRate(cells, sensitive)).toBe(100);
  });
});

describe("countGridAlerts", () => {
  it("counts full public slots and empty sensitive slots", () => {
    const cells = [
      { missionId: "welcome", filled: 6, capacity: 6, isOpen: true },
      { missionId: "cash", filled: 0, capacity: 2, isOpen: true },
      { missionId: "cash", filled: 1, capacity: 2, isOpen: true },
    ];

    expect(countGridAlerts(cells, new Set(["cash"]))).toEqual({
      fullPublicSlots: 1,
      emptySensitiveSlots: 1,
    });
  });
});
