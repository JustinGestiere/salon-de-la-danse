import { z } from "zod";

import { VOLUNTEER_STATUSES } from "@/features/volunteers/status";

/// Filtre « mineurs à valider », en plus des états de planning.
export const VOLUNTEER_LIST_FILTERS = [...VOLUNTEER_STATUSES, "minor"] as const;
export type VolunteerListFilter = (typeof VOLUNTEER_LIST_FILTERS)[number];

const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

/// Filtres de la liste des bénévoles, lus depuis l'URL. Une valeur invalide est
/// ignorée plutôt que de faire échouer la page.
export const volunteerListFilterSchema = z.object({
  q: z.string().trim().max(120).optional().catch(undefined),
  statut: z.enum(VOLUNTEER_LIST_FILTERS).optional().catch(undefined),
  mission: z.string().trim().min(1).max(64).optional().catch(undefined),
  jour: isoDateSchema.optional().catch(undefined),
  page: z.coerce.number().int().min(1).catch(1),
});

export type VolunteerListFilterInput = z.infer<typeof volunteerListFilterSchema>;

export const volunteerIdSchema = z.object({
  volunteerId: z.string().trim().min(1),
});

/// Mêmes règles qu'à l'inscription (voir auth/schemas.ts) : la régie corrige
/// une fiche, elle ne doit pas pouvoir y écrire ce que le bénévole n'aurait pas
/// pu saisir.
export const updateVolunteerProfileSchema = z.object({
  volunteerId: z.string().trim().min(1),
  firstName: z.string().trim().min(1, { message: "Prénom requis." }).max(80),
  lastName: z.string().trim().min(1, { message: "Nom requis." }).max(80),
  email: z.string().trim().toLowerCase().email({ message: "E-mail invalide." }),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9 +().-]{6,20}$/, { message: "Numéro de téléphone invalide." }),
  birthDate: isoDateSchema.or(z.literal("")),
});

export type UpdateVolunteerProfileInput = z.infer<typeof updateVolunteerProfileSchema>;

export const setPlanningLockSchema = z.object({
  volunteerId: z.string().trim().min(1),
  isLocked: z.boolean(),
});
