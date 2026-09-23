import { describe, expect, it } from "vitest";

import { buildCsv, toCsvCell } from "@/features/exports/csv";

describe("toCsvCell", () => {
  it("quotes a value containing the separator", () => {
    expect(toCsvCell("Loges; danseurs")).toBe('"Loges; danseurs"');
  });

  it("doubles the quotes inside a quoted value", () => {
    expect(toCsvCell('Scène "principale"')).toBe('"Scène ""principale"""');
  });

  it("neutralizes a value that a spreadsheet would run as a formula", () => {
    expect(toCsvCell("=HYPERLINK(\"http://example.com\")")).toBe("\"'=HYPERLINK(\"\"http://example.com\"\")\"");
  });

  it("keeps numbers as they are", () => {
    expect(toCsvCell(-3)).toBe("-3");
  });
});

describe("buildCsv", () => {
  it("starts with a BOM and writes the header row first", () => {
    const csv = buildCsv({
      sheetName: "Bénévoles",
      columns: [
        { header: "Nom", width: 10 },
        { header: "Créneaux", width: 10 },
      ],
      rows: [["Moreau", 3]],
    });

    expect(csv).toBe("﻿Nom;Créneaux\r\nMoreau;3\r\n");
  });
});
