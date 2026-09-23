import "server-only";

import { buildCsv } from "@/features/exports/csv";
import type { ExportFormat, ExportTable } from "@/features/exports/table";
import { buildXlsx } from "@/features/exports/xlsx";

const CONTENT_TYPES: Record<ExportFormat, string> = {
  csv: "text/csv; charset=utf-8",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

/// Réponse de téléchargement : fichier joint, jamais mis en cache (données
/// personnelles).
export async function buildExportResponse(table: ExportTable, format: ExportFormat, fileBaseName: string): Promise<Response> {
  const body = format === "csv" ? buildCsv(table) : await buildXlsx(table);
  const today = new Date().toISOString().slice(0, 10);

  return new Response(body, {
    headers: {
      "Content-Type": CONTENT_TYPES[format],
      "Content-Disposition": `attachment; filename="${fileBaseName}-${today}.${format}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
