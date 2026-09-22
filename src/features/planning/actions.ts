"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { isDomainError } from "@/lib/errors";
import { fail, ok, type ActionResult } from "@/lib/result";
import { getSessionUser, getVolunteerForEdition } from "@/features/auth/queries";
import { getActiveEdition, isRegistrationOpen } from "@/features/editions/queries";
import { lockPlanning, toggleAssignment } from "@/features/planning/service";
import type { SlotRules } from "@/features/planning/rules";

const missionSlotIdSchema = z.string().trim().min(1);

type PlanningContext = {
  volunteerId: string;
  editionId: string;
  rules: SlotRules;
  planningStatus: "DRAFT" | "LOCKED";
};

/// Authentifie, vérifie les droits et la fenêtre d'inscription, puis renvoie le
/// contexte prêt pour le service. Une Server Action ne présume rien de l'appelant.
async function resolvePlanningContext(): Promise<
  { ok: true; context: PlanningContext } | { ok: false; error: ReturnType<typeof fail> }
> {
  const user = await getSessionUser();
  if (!user) {
    return { ok: false, error: fail("auth.required", "Veuillez vous connecter.") };
  }

  const edition = await getActiveEdition();
  if (!edition) {
    return { ok: false, error: fail("edition.none", "Aucune édition ouverte.") };
  }
  if (!isRegistrationOpen(edition)) {
    return {
      ok: false,
      error: fail("planning.closed", "Les inscriptions sont fermées ou verrouillées."),
    };
  }

  const volunteer = await getVolunteerForEdition(user.id, edition.id);
  if (!volunteer) {
    return { ok: false, error: fail("volunteer.none", "Participation introuvable.") };
  }

  return {
    ok: true,
    context: {
      volunteerId: volunteer.id,
      editionId: edition.id,
      planningStatus: volunteer.planningStatus,
      rules: {
        minSlots: edition.minSlotsPerVolunteer,
        maxSlots: edition.maxSlotsPerVolunteer,
        maxConsecutive: edition.maxConsecutiveSlots,
      },
    },
  };
}

export async function toggleAssignmentAction(
  rawMissionSlotId: string,
): Promise<ActionResult<{ selected: boolean }>> {
  const parsed = missionSlotIdSchema.safeParse(rawMissionSlotId);
  if (!parsed.success) {
    return fail("validation", "Mission invalide.");
  }

  const resolved = await resolvePlanningContext();
  if (!resolved.ok) return resolved.error;

  try {
    const result = await toggleAssignment(
      resolved.context,
      resolved.context.planningStatus,
      parsed.data,
    );
    revalidatePath("/planning");
    return ok(result);
  } catch (error) {
    if (isDomainError(error)) return fail(error.code, error.message);
    console.error("[toggleAssignmentAction] erreur inattendue", error);
    return fail("unexpected", "Une erreur est survenue. Réessayez.");
  }
}

export async function lockPlanningAction(): Promise<ActionResult> {
  const resolved = await resolvePlanningContext();
  if (!resolved.ok) return resolved.error;

  try {
    await lockPlanning(resolved.context, resolved.context.planningStatus);
    revalidatePath("/planning");
    revalidatePath("/recapitulatif");
    return ok(undefined);
  } catch (error) {
    if (isDomainError(error)) return fail(error.code, error.message);
    console.error("[lockPlanningAction] erreur inattendue", error);
    return fail("unexpected", "Une erreur est survenue. Réessayez.");
  }
}
