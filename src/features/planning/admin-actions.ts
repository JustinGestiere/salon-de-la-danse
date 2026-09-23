"use server";

import { revalidatePath } from "next/cache";

import { fail, type ActionResult } from "@/lib/result";
import { ADMIN_FORBIDDEN_MESSAGE, runAdminOperation } from "@/features/admin/action-helpers";
import { resolveAdminContext, type AdminContext } from "@/features/admin/guards";
import {
  assignVolunteerSchema,
  assignmentIdSchema,
  setSlotOpenSchema,
  updateSlotCapacitySchema,
} from "@/features/planning/admin-schemas";
import {
  assignVolunteerByAdmin,
  removeAssignmentByAdmin,
  setSlotOpen,
  updateSlotCapacity,
} from "@/features/planning/admin-service";

function toActor(context: AdminContext) {
  return {
    editionId: context.edition.id,
    actorId: context.user.id,
    rules: {
      minSlots: context.edition.minSlotsPerVolunteer,
      maxSlots: context.edition.maxSlotsPerVolunteer,
      maxConsecutive: context.edition.maxConsecutiveSlots,
    },
  };
}

/// Toute affectation se voit sur la grille, sur la fiche du bénévole et sur la
/// vue d'ensemble.
function revalidatePlanningViews(): void {
  revalidatePath("/admin/planning");
  revalidatePath("/admin/benevoles");
  revalidatePath("/admin/tableau-de-bord");
}

export async function assignVolunteerAction(input: unknown): Promise<ActionResult<{ isOverride: boolean }>> {
  const parsed = assignVolunteerSchema.safeParse(input);
  if (!parsed.success) return fail("validation", "Affectation invalide.");

  const context = await resolveAdminContext();
  if (!context) return fail("auth.forbidden", ADMIN_FORBIDDEN_MESSAGE);

  return runAdminOperation("assignVolunteerAction", async () => {
    const result = await assignVolunteerByAdmin(toActor(context), parsed.data);
    revalidatePlanningViews();
    return result;
  });
}

export async function removeAssignmentAction(input: unknown): Promise<ActionResult> {
  const parsed = assignmentIdSchema.safeParse(input);
  if (!parsed.success) return fail("validation", "Affectation invalide.");

  const context = await resolveAdminContext();
  if (!context) return fail("auth.forbidden", ADMIN_FORBIDDEN_MESSAGE);

  return runAdminOperation("removeAssignmentAction", async () => {
    await removeAssignmentByAdmin(toActor(context), parsed.data.assignmentId);
    revalidatePlanningViews();
    return undefined;
  });
}

export async function updateSlotCapacityAction(input: unknown): Promise<ActionResult> {
  const parsed = updateSlotCapacitySchema.safeParse(input);
  if (!parsed.success) return fail("validation", "Jauge invalide.");

  const context = await resolveAdminContext();
  if (!context) return fail("auth.forbidden", ADMIN_FORBIDDEN_MESSAGE);

  return runAdminOperation("updateSlotCapacityAction", async () => {
    await updateSlotCapacity(toActor(context), parsed.data.missionSlotId, parsed.data.capacity);
    revalidatePlanningViews();
    return undefined;
  });
}

export async function setSlotOpenAction(input: unknown): Promise<ActionResult> {
  const parsed = setSlotOpenSchema.safeParse(input);
  if (!parsed.success) return fail("validation", "Requête invalide.");

  const context = await resolveAdminContext();
  if (!context) return fail("auth.forbidden", ADMIN_FORBIDDEN_MESSAGE);

  return runAdminOperation("setSlotOpenAction", async () => {
    await setSlotOpen(toActor(context), parsed.data.missionSlotId, parsed.data.isOpen);
    revalidatePlanningViews();
    return undefined;
  });
}
