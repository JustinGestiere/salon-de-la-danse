import { z } from "zod";

import { volunteerListFilterSchema } from "@/features/volunteers/admin-schemas";
import { EXPORT_FORMATS } from "@/features/exports/table";

const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const exportFormatSchema = z.enum(EXPORT_FORMATS).catch("xlsx");

/// Absente : l'édition en cours. Renseignée : une édition passée, consultée depuis
/// les réglages.
const editionIdSchema = z.string().trim().min(1).max(64).optional().catch(undefined);

/// Mêmes filtres que la liste des bénévoles : l'export reprend exactement ce
/// que l'écran affiche, sans la pagination.
export const volunteerExportParamsSchema = volunteerListFilterSchema.omit({ page: true }).extend({
  format: exportFormatSchema,
  edition: editionIdSchema,
});

export type VolunteerExportParams = z.infer<typeof volunteerExportParamsSchema>;

/// Planning général, ou restreint à un jour et/ou une mission (listes par mission).
export const planningExportParamsSchema = z.object({
  jour: isoDateSchema.optional().catch(undefined),
  mission: z.string().trim().min(1).max(64).optional().catch(undefined),
  format: exportFormatSchema,
  edition: editionIdSchema,
});

export type PlanningExportParams = z.infer<typeof planningExportParamsSchema>;
