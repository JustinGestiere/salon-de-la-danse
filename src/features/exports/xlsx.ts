import "server-only";

import ExcelJS from "exceljs";

import type { ExportTable } from "@/features/exports/table";

/// Classeur d'une feuille : en-tête en gras figé et filtre automatique, pour
/// trier et filtrer directement dans Excel.
export async function buildXlsx(table: ExportTable): Promise<Uint8Array<ArrayBuffer>> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Régie du Salon de la Danse";
  const sheet = workbook.addWorksheet(table.sheetName, { views: [{ state: "frozen", ySplit: 1 }] });

  sheet.columns = table.columns.map((column) => ({ header: column.header, width: column.width }));
  sheet.getRow(1).font = { bold: true };
  sheet.addRows(table.rows.map((row) => [...row]));
  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: table.columns.length } };

  const buffer = await workbook.xlsx.writeBuffer();
  return new Uint8Array(buffer);
}
