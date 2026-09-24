"use server";

import { isDomainError } from "@/lib/errors";
import { fail, ok, type ActionResult } from "@/lib/result";
import { resolveAdminContext } from "@/features/admin/guards";
import { reminderCampaignSchema } from "@/features/notifications/schemas";
import { sendReminderCampaign, type CampaignReport } from "@/features/notifications/reminder-service";

/// Relance e-mail déclenchée par la régie. Ordre imposé : validation Zod,
/// droits, service, résultat typé. Rien à invalider : aucune page n'affiche
/// l'historique des envois hormis le journal, rendu à chaque visite.
export async function sendReminderCampaignAction(input: unknown): Promise<ActionResult<CampaignReport>> {
  const parsed = reminderCampaignSchema.safeParse(input);
  if (!parsed.success) {
    return fail("validation", "Relance inconnue.");
  }

  const context = await resolveAdminContext();
  if (!context) {
    return fail("auth.forbidden", "Action réservée à un administrateur.");
  }

  try {
    const report = await sendReminderCampaign({
      edition: context.edition,
      campaign: parsed.data.campaign,
      actorId: context.user.id,
    });
    return ok(report);
  } catch (error) {
    if (isDomainError(error)) return fail(error.code, error.message);
    console.error("[sendReminderCampaignAction] erreur inattendue", error);
    return fail("unexpected", "Une erreur est survenue. Réessayez.");
  }
}
