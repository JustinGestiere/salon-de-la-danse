import { describe, expect, it } from "vitest";

import { categorizeAuditAction, describeAuditEntry } from "@/features/audit/describe";

describe("describeAuditEntry", () => {
  it("lists every changed field with its before and after values", () => {
    const description = describeAuditEntry("missionSlot.capacityUpdated", {
      target: "Accueil, sam. 15 mai 10h-12h",
      before: { capacity: 6 },
      after: { capacity: 8 },
    });

    expect(description.diffs).toEqual([{ field: "capacity", before: "6", after: "8" }]);
  });

  it("reads the code of legacy invitation entries as their target", () => {
    const description = describeAuditEntry("invitation.deleted", { code: "INV-ABC234" });

    expect(description.target).toBe("INV-ABC234");
  });

  it("keeps the override reason of a forced assignment", () => {
    const description = describeAuditEntry("assignment.adminCreated", {
      target: "Hugo Lefèvre",
      override: "Vous ne pouvez pas dépasser 3 créneaux.",
    });

    expect(description.override).toBe("Vous ne pouvez pas dépasser 3 créneaux.");
  });

  it("falls back to the raw action when it has no sentence", () => {
    expect(describeAuditEntry("unknown.action", null).sentence).toBe("unknown.action");
  });

  it("ignores malformed changes instead of throwing", () => {
    expect(describeAuditEntry("volunteer.passwordReset", "not an object").diffs).toEqual([]);
  });
});

describe("categorizeAuditAction", () => {
  it("files mission and mission slot actions under the grid category", () => {
    expect(categorizeAuditAction("missionSlot.capacityUpdated")).toBe("grid");
  });

  it("returns null for an unknown prefix", () => {
    expect(categorizeAuditAction("unknown.action")).toBeNull();
  });
});
