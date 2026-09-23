import type { ExportCell, ExportTable } from "@/features/exports/table";

/// Excel en version française attend le point-virgule et reconnaît l'UTF-8
/// grâce au BOM : sans lui, les accents s'affichent mal à l'ouverture.
const CSV_SEPARATOR = ";";
const CSV_LINE_BREAK = "\r\n";
const UTF8_BOM = "﻿";

/// Une cellule qui commence par l'un de ces caractères est interprétée comme
/// une formule par les tableurs (injection CSV) : on la neutralise.
const FORMULA_TRIGGERS = ["=", "+", "-", "@", "\t", "\r"];
const NEEDS_QUOTES = /[";\r\n]/;

function neutralizeFormula(value: string): string {
  return FORMULA_TRIGGERS.some((trigger) => value.startsWith(trigger)) ? `'${value}` : value;
}

export function toCsvCell(cell: ExportCell): string {
  if (typeof cell === "number") return String(cell);
  const safe = neutralizeFormula(cell);
  return NEEDS_QUOTES.test(safe) ? `"${safe.replaceAll('"', '""')}"` : safe;
}

export function buildCsv(table: ExportTable): string {
  const lines = [table.columns.map((column) => column.header), ...table.rows].map((row) =>
    row.map(toCsvCell).join(CSV_SEPARATOR),
  );
  return `${UTF8_BOM}${lines.join(CSV_LINE_BREAK)}${CSV_LINE_BREAK}`;
}
