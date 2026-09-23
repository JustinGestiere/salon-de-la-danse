import { describe, expect, it } from "vitest";

import { splitIntoSheets } from "@/features/badges/sheets";

describe("splitIntoSheets", () => {
  it("fills full sheets and puts the rest on a last one", () => {
    const sheets = splitIntoSheets(Array.from({ length: 19 }, (_, index) => index));

    expect(sheets.map((sheet) => sheet.length)).toEqual([8, 8, 3]);
  });

  it("returns no sheet for an empty selection", () => {
    expect(splitIntoSheets([])).toEqual([]);
  });
});
