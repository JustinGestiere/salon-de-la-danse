"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { toFieldErrors } from "@/lib/field-errors";
import { fail, type ActionResult } from "@/lib/result";
import { ADMIN_FORBIDDEN_MESSAGE, runAdminOperation } from "@/features/admin/action-helpers";
import { resolveAdminContext, type AdminContext } from "@/features/admin/guards";
import {
  setPlanningLockSchema,
  updateVolunteerProfileSchema,
  volunteerIdSchema,
} from "@/features/volunteers/admin-schemas";
import {
  approveMinorParticipation,
  resetVolunteerPassword,
  setPlanningLock,
  updateVolunteerProfile,
  type AdminActor,
} from "@/features/volunteers/admin-service";

function toActor(context: AdminContext): AdminActor {
  return { editionId: context.edition.id, actorId: context.user.id };
}

function revalidateVolunteerViews(): void {
  revalidatePath("/admin/benevoles");
  revalidatePath("/admin/tableau-de-bord");
  revalidatePath("/admin/badges");
}

export async function updateVolunteerProfileAction(input: unknown): Promise<ActionResult> {
  const parsed = updateVolunteerProfileSchema.safeParse(input);
  if (!parsed.success) {
    return fail("validation", "Veuillez corriger les champs indiqués.", toFieldErrors(parsed.error.issues));
  }

  const context = await resolveAdminContext();
  if (!context) return fail("auth.forbidden", ADMIN_FORBIDDEN_MESSAGE);

  return runAdminOperation("updateVolunteerProfileAction", async () => {
    await updateVolunteerProfile(toActor(context), parsed.data);
    revalidateVolunteerViews();
    return undefined;
  });
}

export async function setPlanningLockAction(input: unknown): Promise<ActionResult> {
  const parsed = setPlanningLockSchema.safeParse(input);
  if (!parsed.success) return fail("validation", "Requête invalide.");

  const context = await resolveAdminContext();
  if (!context) return fail("auth.forbidden", ADMIN_FORBIDDEN_MESSAGE);

  return runAdminOperation("setPlanningLockAction", async () => {
    await setPlanningLock(toActor(context), parsed.data.volunteerId, parsed.data.isLocked);
    revalidateVolunteerViews();
    return undefined;
  });
}

export async function approveMinorAction(input: unknown): Promise<ActionResult> {
  const parsed = volunteerIdSchema.safeParse(input);
  if (!parsed.success) return fail("validation", "Requête invalide.");

  const context = await resolveAdminContext();
  if (!context) return fail("auth.forbidden", ADMIN_FORBIDDEN_MESSAGE);

  return runAdminOperation("approveMinorAction", async () => {
    await approveMinorParticipation(toActor(context), parsed.data.volunteerId);
    revalidateVolunteerViews();
    return undefined;
  });
}

export async function resetVolunteerPasswordAction(
  input: unknown,
): Promise<ActionResult<{ temporaryPassword: string }>> {
  const parsed = volunteerIdSchema.safeParse(input);
  if (!parsed.success) return fail("validation", "Requête invalide.");

  const context = await resolveAdminContext();
  if (!context) return fail("auth.forbidden", ADMIN_FORBIDDEN_MESSAGE);

  const requestHeaders = await headers();
  return runAdminOperation("resetVolunteerPasswordAction", () =>
    resetVolunteerPassword(toActor(context), parsed.data.volunteerId, requestHeaders),
  );
}
