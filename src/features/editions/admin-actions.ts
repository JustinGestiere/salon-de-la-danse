"use server";

import { revalidatePath } from "next/cache";

import { toFieldErrors } from "@/lib/field-errors";
import { fail, type ActionResult } from "@/lib/result";
import { ADMIN_FORBIDDEN_MESSAGE, runAdminOperation } from "@/features/admin/action-helpers";
import { resolveAdminContext, resolveAdminUser, type AdminContext } from "@/features/admin/guards";
import {
  createEditionSchema,
  createMissionSchema,
  editionIdSchema,
  missionAccessSchema,
  missionCapacitySchema,
  quotasSchema,
  registrationLockSchema,
  registrationWindowSchema,
  welcomeSchema,
} from "@/features/editions/admin-schemas";
import { getTemplateEdition } from "@/features/editions/admin-queries";
import {
  applyMissionCapacity,
  createMission,
  setMissionAccess,
  setRegistrationLock,
  updateQuotas,
  updateRegistrationWindow,
  updateWelcome,
  type EditionActor,
} from "@/features/editions/admin-service";
import { archiveEdition, createEdition } from "@/features/editions/lifecycle-service";

function toActor(context: AdminContext): EditionActor {
  return { editionId: context.edition.id, editionName: context.edition.name, actorId: context.user.id };
}

/// Les réglages de l'édition se lisent partout : barre de navigation, vue
/// d'ensemble, planning. On invalide donc tout le back-office.
function revalidateAdmin(): void {
  revalidatePath("/admin", "layout");
}

function invalidInput(issues: readonly { path: readonly PropertyKey[]; message: string }[]) {
  return fail("validation", "Veuillez corriger les champs indiqués.", toFieldErrors(issues));
}

export async function updateRegistrationWindowAction(input: unknown): Promise<ActionResult> {
  const parsed = registrationWindowSchema.safeParse(input);
  if (!parsed.success) return invalidInput(parsed.error.issues);
  const context = await resolveAdminContext();
  if (!context) return fail("auth.forbidden", ADMIN_FORBIDDEN_MESSAGE);

  return runAdminOperation("updateRegistrationWindowAction", async () => {
    await updateRegistrationWindow(toActor(context), parsed.data);
    revalidateAdmin();
    return undefined;
  });
}

export async function setRegistrationLockAction(input: unknown): Promise<ActionResult> {
  const parsed = registrationLockSchema.safeParse(input);
  if (!parsed.success) return fail("validation", "Requête invalide.");
  const context = await resolveAdminContext();
  if (!context) return fail("auth.forbidden", ADMIN_FORBIDDEN_MESSAGE);

  return runAdminOperation("setRegistrationLockAction", async () => {
    await setRegistrationLock(toActor(context), parsed.data.isLocked);
    revalidateAdmin();
    return undefined;
  });
}

export async function updateQuotasAction(input: unknown): Promise<ActionResult> {
  const parsed = quotasSchema.safeParse(input);
  if (!parsed.success) return invalidInput(parsed.error.issues);
  const context = await resolveAdminContext();
  if (!context) return fail("auth.forbidden", ADMIN_FORBIDDEN_MESSAGE);

  return runAdminOperation("updateQuotasAction", async () => {
    await updateQuotas(toActor(context), parsed.data);
    revalidateAdmin();
    return undefined;
  });
}

export async function updateWelcomeAction(input: unknown): Promise<ActionResult> {
  const parsed = welcomeSchema.safeParse(input);
  if (!parsed.success) return invalidInput(parsed.error.issues);
  const context = await resolveAdminContext();
  if (!context) return fail("auth.forbidden", ADMIN_FORBIDDEN_MESSAGE);

  return runAdminOperation("updateWelcomeAction", async () => {
    await updateWelcome(toActor(context), parsed.data);
    revalidateAdmin();
    return undefined;
  });
}

export async function createMissionAction(input: unknown): Promise<ActionResult> {
  const parsed = createMissionSchema.safeParse(input);
  if (!parsed.success) return invalidInput(parsed.error.issues);
  const context = await resolveAdminContext();
  if (!context) return fail("auth.forbidden", ADMIN_FORBIDDEN_MESSAGE);

  return runAdminOperation("createMissionAction", async () => {
    await createMission(toActor(context), parsed.data);
    revalidateAdmin();
    return undefined;
  });
}

export async function setMissionAccessAction(input: unknown): Promise<ActionResult> {
  const parsed = missionAccessSchema.safeParse(input);
  if (!parsed.success) return fail("validation", "Requête invalide.");
  const context = await resolveAdminContext();
  if (!context) return fail("auth.forbidden", ADMIN_FORBIDDEN_MESSAGE);

  return runAdminOperation("setMissionAccessAction", async () => {
    await setMissionAccess(toActor(context), parsed.data.missionId, parsed.data.isSelfBookable);
    revalidateAdmin();
    return undefined;
  });
}

export async function applyMissionCapacityAction(input: unknown): Promise<ActionResult> {
  const parsed = missionCapacitySchema.safeParse(input);
  if (!parsed.success) return fail("validation", "Jauge invalide.");
  const context = await resolveAdminContext();
  if (!context) return fail("auth.forbidden", ADMIN_FORBIDDEN_MESSAGE);

  return runAdminOperation("applyMissionCapacityAction", async () => {
    await applyMissionCapacity(toActor(context), parsed.data.missionId, parsed.data.capacity);
    revalidateAdmin();
    return undefined;
  });
}

/// Seule action qui ne demande pas d'édition active : elle sert justement à en
/// créer une.
export async function createEditionAction(input: unknown): Promise<ActionResult<{ editionId: string }>> {
  const parsed = createEditionSchema.safeParse(input);
  if (!parsed.success) return invalidInput(parsed.error.issues);
  const user = await resolveAdminUser();
  if (!user) return fail("auth.forbidden", ADMIN_FORBIDDEN_MESSAGE);

  const source = await getTemplateEdition();
  return runAdminOperation("createEditionAction", async () => {
    const result = await createEdition(user.id, parsed.data, source?.id ?? null);
    revalidateAdmin();
    return result;
  });
}

export async function archiveEditionAction(input: unknown): Promise<ActionResult> {
  const parsed = editionIdSchema.safeParse(input);
  if (!parsed.success) return fail("validation", "Requête invalide.");
  const user = await resolveAdminUser();
  if (!user) return fail("auth.forbidden", ADMIN_FORBIDDEN_MESSAGE);

  return runAdminOperation("archiveEditionAction", async () => {
    await archiveEdition(user.id, parsed.data.editionId);
    revalidateAdmin();
    return undefined;
  });
}
