import "server-only";

import { env } from "@/lib/env";
import { isMailerConfigured, trySendMail } from "@/lib/mailer";
import { getEditionDays } from "@/features/editions/queries";
import { getVolunteerContact } from "@/features/notifications/queries";
import {
  buildPlanningConfirmationEmail,
  buildWelcomeEmail,
} from "@/features/notifications/volunteer-emails";
import { getVolunteerSchedule } from "@/features/volunteers/queries";

/// E-mail de bienvenue après l'inscription. Ne lève jamais : le compte est
/// créé quoi qu'il arrive à l'e-mail.
export async function sendWelcomeEmail(volunteerId: string): Promise<void> {
  if (!isMailerConfigured()) return;
  const contact = await getVolunteerContact(volunteerId);
  if (!contact) return;

  const eventDays = await getEditionDays(contact.editionId);
  const message = buildWelcomeEmail({
    to: contact.email,
    firstName: contact.firstName,
    editionName: contact.editionName,
    appUrl: env.NEXT_PUBLIC_APP_URL,
    eventDays,
    minSlots: contact.minSlots,
    maxSlots: contact.maxSlots,
  });
  await trySendMail(message, { volunteerId, kind: "welcome" });
}

/// Récapitulatif envoyé quand le bénévole valide définitivement son planning.
export async function sendPlanningConfirmationEmail(volunteerId: string): Promise<void> {
  if (!isMailerConfigured()) return;
  const contact = await getVolunteerContact(volunteerId);
  if (!contact) return;

  const schedule = await getVolunteerSchedule(volunteerId);
  const message = buildPlanningConfirmationEmail({
    to: contact.email,
    firstName: contact.firstName,
    editionName: contact.editionName,
    appUrl: env.NEXT_PUBLIC_APP_URL,
    schedule,
  });
  await trySendMail(message, { volunteerId, kind: "planningConfirmation" });
}
