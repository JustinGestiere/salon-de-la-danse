import { z } from "zod";

/// Au-delà, c'est sûrement une faute de frappe : aucune mission du salon
/// n'accueille autant de bénévoles sur un même créneau.
export const MAX_SLOT_CAPACITY = 50;

export const assignVolunteerSchema = z.object({
  missionSlotId: z.string().trim().min(1),
  volunteerId: z.string().trim().min(1),
  /// true quand l'admin a confirmé passer outre une règle ou une jauge.
  force: z.boolean(),
});

export type AssignVolunteerInput = z.infer<typeof assignVolunteerSchema>;

export const assignmentIdSchema = z.object({
  assignmentId: z.string().trim().min(1),
});

export const updateSlotCapacitySchema = z.object({
  missionSlotId: z.string().trim().min(1),
  capacity: z.coerce.number().int().min(0).max(MAX_SLOT_CAPACITY),
});

export const setSlotOpenSchema = z.object({
  missionSlotId: z.string().trim().min(1),
  isOpen: z.boolean(),
});

const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

/// Paramètres d'URL de l'écran planning de la régie.
export const adminPlanningParamsSchema = z.object({
  jour: isoDateSchema.optional().catch(undefined),
  case: z.string().trim().min(1).max(64).optional().catch(undefined),
  recherche: z.string().trim().max(80).optional().catch(undefined),
});

/// Code d'erreur renvoyé quand une affectation enfreint une règle : l'interface
/// propose alors de confirmer la dérogation.
export const OVERRIDE_REQUIRED_CODE = "override.required";
