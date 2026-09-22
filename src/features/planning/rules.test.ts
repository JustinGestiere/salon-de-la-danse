import { describe, expect, it } from "vitest";

import { canAddCell, validateSelection, type SelectedCell, type SlotRules } from "./rules";

const RULES: SlotRules = { minSlots: 1, maxSlots: 3, maxConsecutive: 2 };

function cell(id: string, date: string, position: number): SelectedCell {
  return { missionSlotId: `ms-${id}`, timeSlotId: `ts-${date}-${position}`, eventDate: date, position };
}

describe("validateSelection", () => {
  it("rejects an empty selection as too few", () => {
    const violations = validateSelection([], RULES);
    expect(violations.map((v) => v.code)).toContain("tooFew");
  });

  it("accepts a valid non-consecutive selection", () => {
    const cells = [cell("a", "2027-05-14", 1), cell("b", "2027-05-14", 3)];
    expect(validateSelection(cells, RULES)).toEqual([]);
  });

  it("rejects more slots than the maximum", () => {
    const cells = [
      cell("a", "2027-05-14", 1),
      cell("b", "2027-05-15", 1),
      cell("c", "2027-05-16", 1),
      cell("d", "2027-05-16", 3),
    ];
    expect(validateSelection(cells, RULES).map((v) => v.code)).toContain("tooMany");
  });

  it("rejects two missions on the same time slot", () => {
    const first = cell("a", "2027-05-14", 2);
    const second: SelectedCell = { ...cell("b", "2027-05-14", 2), timeSlotId: first.timeSlotId };
    expect(validateSelection([first, second], RULES).map((v) => v.code)).toContain("overlap");
  });

  it("rejects three consecutive slots on the same day", () => {
    const cells = [
      cell("a", "2027-05-14", 1),
      cell("b", "2027-05-14", 2),
      cell("c", "2027-05-14", 3),
    ];
    expect(validateSelection(cells, RULES).map((v) => v.code)).toContain("tooManyConsecutive");
  });

  it("allows consecutive slots that reset across days", () => {
    const cells = [
      cell("a", "2027-05-14", 4),
      cell("b", "2027-05-14", 5),
      cell("c", "2027-05-15", 1),
    ];
    expect(validateSelection(cells, RULES)).toEqual([]);
  });
});

describe("canAddCell", () => {
  it("blocks adding a third consecutive slot", () => {
    const current = [cell("a", "2027-05-14", 1), cell("b", "2027-05-14", 2)];
    const violation = canAddCell(current, cell("c", "2027-05-14", 3), RULES);
    expect(violation?.code).toBe("tooManyConsecutive");
  });

  it("blocks a second mission on an occupied slot", () => {
    const current = [cell("a", "2027-05-14", 1)];
    const candidate: SelectedCell = { ...cell("b", "2027-05-14", 1), timeSlotId: current[0]!.timeSlotId };
    expect(canAddCell(current, candidate, RULES)?.code).toBe("overlap");
  });

  it("allows a valid addition", () => {
    const current = [cell("a", "2027-05-14", 1)];
    expect(canAddCell(current, cell("b", "2027-05-15", 1), RULES)).toBeNull();
  });

  it("is idempotent when the cell is already selected", () => {
    const current = [cell("a", "2027-05-14", 1)];
    expect(canAddCell(current, cell("a", "2027-05-14", 1), RULES)).toBeNull();
  });
});
