import { toQueryParams } from "@/lib/url";
import { resolveExportEdition } from "@/features/exports/edition-scope";
import { getPlanningExport } from "@/features/exports/queries";
import { buildExportResponse } from "@/features/exports/response";
import { planningExportParamsSchema } from "@/features/exports/schemas";

/// Export Excel ou CSV du planning général, filtrable par jour et par mission.
export async function GET(request: Request): Promise<Response> {
  const searchParams = new URL(request.url).searchParams;
  const { format, edition: editionId, ...filter } = planningExportParamsSchema.parse(
    toQueryParams(Object.fromEntries(searchParams)),
  );
  const edition = await resolveExportEdition(editionId);
  if (!edition) return new Response(null, { status: 404 });

  const table = await getPlanningExport(edition.id, filter);
  return buildExportResponse(table, format, `planning-${edition.slug}`);
}
