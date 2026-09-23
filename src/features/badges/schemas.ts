import { z } from "zod";

import { volunteerListFilterSchema } from "@/features/volunteers/admin-schemas";

/// Qui imprimer : les plannings validés (cas nominal), tous les comptes, ou la
/// sélection faite avec les filtres de la liste des bénévoles.
export const BADGE_SCOPES = ["validated", "all", "selection"] as const;
export type BadgeScope = (typeof BADGE_SCOPES)[number];

export const BADGE_SCOPE_LABELS: Record<BadgeScope, { label: string; hint: string }> = {
  validated: { label: "Plannings validés", hint: "Le cas nominal, avant le salon" },
  all: { label: "Tous les comptes", hint: "Brouillons compris" },
  selection: { label: "Sélection filtrée", hint: "Filtrez la liste des bénévoles, puis imprimez" },
};

export const badgePageParamsSchema = z.object({
  perimetre: z.enum(BADGE_SCOPES).catch("validated"),
});

/// Paramètres de la planche imprimable : un périmètre avec les filtres de la
/// liste, ou un seul bénévole depuis sa fiche.
export const badgePrintParamsSchema = volunteerListFilterSchema.omit({ page: true }).extend({
  perimetre: z.enum(BADGE_SCOPES).catch("validated"),
  benevole: z.string().trim().min(1).max(64).optional().catch(undefined),
});

export type BadgePrintParams = z.infer<typeof badgePrintParamsSchema>;
