"use server";

import { revalidatePath } from "next/cache";

import { isDomainError } from "@/lib/errors";
import { fail, ok, type ActionResult } from "@/lib/result";
import { resolveAdminContext } from "@/features/admin/guards";
import {
  resendInvitationEmail,
  sendInvitationEmails,
  type InvitationSendReport,
} from "@/features/invitations/email-service";
import {
  deleteInvitationSchema,
  generateInvitationsSchema,
  resendInvitationSchema,
  splitEmailList,
} from "@/features/invitations/schemas";
import {
  deleteUnusedInvitationCode,
  generateInvitationCodes,
} from "@/features/invitations/service";

const INVITATIONS_PATH = "/admin/invitations";

function toFieldErrors(issues: { path: PropertyKey[]; message: string }[]): Record<
  string,
  string[]
> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "form");
    (fieldErrors[key] ??= []).push(issue.message);
  }
  return fieldErrors;
}

/// Ordre imposé : validation Zod, vérification des droits, service,
/// invalidation du cache, résultat typé.
export async function generateInvitationsAction(
  input: unknown,
): Promise<ActionResult<{ created: number } & InvitationSendReport>> {
  const parsed = generateInvitationsSchema.safeParse(input);
  if (!parsed.success) {
    return fail(
      "validation",
      "Veuillez corriger les champs indiqués.",
      toFieldErrors(parsed.error.issues),
    );
  }

  const context = await resolveAdminContext();
  if (!context) {
    return fail("auth.forbidden", "Action réservée à un administrateur.");
  }

  const emails = splitEmailList(parsed.data.emails);
  const recipients: (string | null)[] =
    emails.length > 0
      ? emails
      : Array.from({ length: parsed.data.count }, () => null);

  try {
    const generated = await generateInvitationCodes({
      editionId: context.edition.id,
      actorId: context.user.id,
      recipients,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
    });
    // Les codes sont déjà en base : un envoi en échec se rattrape avec
    // « Renvoyer », il n'annule pas la génération.
    const report = await sendInvitationEmails({
      editionId: context.edition.id,
      editionName: context.edition.name,
      actorId: context.user.id,
      invitations: generated.recipients,
    });
    revalidatePath(INVITATIONS_PATH);
    revalidatePath("/admin/tableau-de-bord");
    return ok({ created: generated.created, ...report });
  } catch (error) {
    if (isDomainError(error)) return fail(error.code, error.message);
    console.error("[generateInvitationsAction] erreur inattendue", error);
    return fail("unexpected", "Une erreur est survenue. Réessayez.");
  }
}

export async function deleteInvitationAction(
  input: unknown,
): Promise<ActionResult> {
  const parsed = deleteInvitationSchema.safeParse(input);
  if (!parsed.success) {
    return fail("validation", "Code invalide.");
  }

  const context = await resolveAdminContext();
  if (!context) {
    return fail("auth.forbidden", "Action réservée à un administrateur.");
  }

  try {
    await deleteUnusedInvitationCode({
      invitationId: parsed.data.invitationId,
      editionId: context.edition.id,
      actorId: context.user.id,
    });
    revalidatePath(INVITATIONS_PATH);
    revalidatePath("/admin/tableau-de-bord");
    return ok(undefined);
  } catch (error) {
    if (isDomainError(error)) return fail(error.code, error.message);
    console.error("[deleteInvitationAction] erreur inattendue", error);
    return fail("unexpected", "Une erreur est survenue. Réessayez.");
  }
}

export async function resendInvitationAction(input: unknown): Promise<ActionResult> {
  const parsed = resendInvitationSchema.safeParse(input);
  if (!parsed.success) {
    return fail("validation", "Code invalide.");
  }

  const context = await resolveAdminContext();
  if (!context) {
    return fail("auth.forbidden", "Action réservée à un administrateur.");
  }

  try {
    await resendInvitationEmail({
      invitationId: parsed.data.invitationId,
      editionId: context.edition.id,
      editionName: context.edition.name,
      actorId: context.user.id,
    });
    revalidatePath(INVITATIONS_PATH);
    return ok(undefined);
  } catch (error) {
    if (isDomainError(error)) return fail(error.code, error.message);
    console.error("[resendInvitationAction] erreur inattendue", error);
    return fail("unexpected", "Une erreur est survenue. Réessayez.");
  }
}
