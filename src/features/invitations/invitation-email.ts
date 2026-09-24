import { buildAppLink, renderEmail } from "@/lib/email-layout";
import { formatDate } from "@/lib/format";
import type { MailMessage } from "@/lib/mailer";

type InvitationEmailInput = {
  to: string;
  appUrl: string;
  code: string;
  editionName: string;
  expiresAt: Date | null;
};

/// Lien d'inscription avec le code déjà saisi : le bénévole n'a plus qu'à
/// compléter ses informations.
export function buildInvitationLink(appUrl: string, code: string): string {
  return buildAppLink(appUrl, `/inscription?code=${encodeURIComponent(code)}`);
}

export function buildInvitationEmail({ to, appUrl, code, editionName, expiresAt }: InvitationEmailInput): MailMessage {
  const { html, text } = renderEmail({
    greeting: "Bonjour,",
    paragraphs: [
      `Votre candidature de bénévole pour ${editionName} a été retenue : bienvenue dans la troupe !`,
      `Voici votre code d'invitation personnel : ${code}`,
      "Il vous permet de créer votre compte, d'ajouter votre photo pour le badge, puis de choisir vos créneaux.",
    ],
    action: { label: "Créer mon compte bénévole", url: buildInvitationLink(appUrl, code) },
    footnote: expiresAt
      ? `Ce code est valable jusqu'au ${formatDate(expiresAt)} et ne sert qu'une fois.`
      : "Ce code ne sert qu'une fois : ne le transmettez pas.",
  });

  return { to, subject: `Votre invitation bénévole · ${editionName}`, text, html };
}
