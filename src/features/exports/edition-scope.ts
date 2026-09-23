import "server-only";

import { resolveAdminUser } from "@/features/admin/guards";
import { getEditionReference, type EditionReference } from "@/features/editions/admin-queries";
import { getActiveEdition } from "@/features/editions/queries";

/// Édition visée par un export : celle demandée (consultation d'une édition
/// archivée) ou, à défaut, l'édition en cours. Null si l'appelant n'est pas
/// administrateur ou si l'édition n'existe pas.
export async function resolveExportEdition(requestedEditionId: string | undefined): Promise<EditionReference | null> {
  const user = await resolveAdminUser();
  if (!user) return null;
  if (requestedEditionId) return getEditionReference(requestedEditionId);
  return getActiveEdition();
}
