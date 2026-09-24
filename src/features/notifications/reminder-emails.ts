import { buildAppLink, renderEmail } from "@/lib/email-layout";
import { formatDateTime } from "@/lib/format";
import type { MailMessage } from "@/lib/mailer";
import { groupScheduleByDay, type EmailScheduleEntry } from "@/features/notifications/volunteer-emails";

type ReminderBase = {
  to: string;
  firstName: string;
  editionName: string;
  appUrl: string;
};

export function buildDraftPlanningReminder(input: ReminderBase & { closesAt: Date }): MailMessage {
  const { html, text } = renderEmail({
    greeting: `Bonjour ${input.firstName},`,
    paragraphs: [
      `Votre planning pour ${input.editionName} n'est pas encore validé.`,
      `Les inscriptions ferment le ${formatDateTime(input.closesAt)} : pensez à choisir vos créneaux puis à cliquer sur « Valider définitivement ».`,
    ],
    action: { label: "Finaliser mon planning", url: buildAppLink(input.appUrl, "/planning") },
  });
  return { to: input.to, subject: `Votre planning attend d'être validé · ${input.editionName}`, text, html };
}

export function buildMissingPhotoReminder(input: ReminderBase & { contactEmail: string | null }): MailMessage {
  const howToSend = input.contactEmail
    ? `Envoyez une photo d'identité récente à l'équipe d'organisation : ${input.contactEmail}.`
    : "Envoyez une photo d'identité récente à l'équipe d'organisation en répondant à cet e-mail.";
  const { html, text } = renderEmail({
    greeting: `Bonjour ${input.firstName},`,
    paragraphs: [
      `Il nous manque votre photo pour imprimer votre badge de bénévole ${input.editionName}.`,
      howToSend,
    ],
  });
  return { to: input.to, subject: `Photo manquante pour votre badge · ${input.editionName}`, text, html };
}

export function buildEventReminder(input: ReminderBase & { schedule: readonly EmailScheduleEntry[] }): MailMessage {
  const { html, text } = renderEmail({
    greeting: `Bonjour ${input.firstName},`,
    paragraphs: [`${input.editionName} approche ! Voici le rappel de vos créneaux :`],
    sections: groupScheduleByDay(input.schedule),
    action: { label: "Voir mon récapitulatif", url: buildAppLink(input.appUrl, "/recapitulatif") },
  });
  return { to: input.to, subject: `Rappel de vos créneaux · ${input.editionName}`, text, html };
}
