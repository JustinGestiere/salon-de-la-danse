import { toQueryParams } from "@/lib/url";
import { getEditionStart } from "@/features/editions/queries";
import { resolveExportEdition } from "@/features/exports/edition-scope";
import { getVolunteerExport } from "@/features/exports/queries";
import { buildExportResponse } from "@/features/exports/response";
import { volunteerExportParamsSchema } from "@/features/exports/schemas";

/// Export Excel ou CSV de la liste des bénévoles, avec les filtres de l'écran.
export async function GET(request: Request): Promise<Response> {
  const searchParams = new URL(request.url).searchParams;
  const { format, edition: editionId, ...filter } = volunteerExportParamsSchema.parse(
    toQueryParams(Object.fromEntries(searchParams)),
  );
  const edition = await resolveExportEdition(editionId);
  if (!edition) return new Response(null, { status: 404 });

  const eventStartsAt = await getEditionStart(edition.id);
  const table = await getVolunteerExport(edition.id, filter, eventStartsAt);
  return buildExportResponse(table, format, `benevoles-${edition.slug}`);
}
