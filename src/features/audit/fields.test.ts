import { describe, expect, it } from "vitest";

import { toAuditDiffView } from "@/features/audit/fields";

describe("toAuditDiffView", () => {
  it("translates the field name and the planning status", () => {
    const view = toAuditDiffView({ field: "planningStatus", before: "LOCKED", after: "DRAFT" });

    expect(view).toEqual({ label: "Planning", before: "Validé", after: "Brouillon" });
  });

  it("keeps the technical name of an unknown field", () => {
    expect(toAuditDiffView({ field: "unknownField", before: null, after: "1" }).label).toBe("unknownField");
  });
});
