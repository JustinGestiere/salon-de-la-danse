import { renderEmail } from "@/lib/email-layout";
import type { MailMessage } from "@/lib/mailer";
import { PASSWORD_RESET_TOKEN_TTL_MINUTES } from "@/features/auth/constants";
import { RESET_PASSWORD_PATH } from "@/features/auth/redirects";

type PasswordResetEmailInput = {
  to: string;
  appUrl: string;
  token: string;
};

/// Lien vers notre propre page de réinitialisation. On n'utilise pas l'URL
/// fournie par Better Auth : elle passe par une redirection de son API alors
/// que le jeton suffit à notre formulaire.
export function buildPasswordResetUrl(appUrl: string, token: string): string {
  const url = new URL(RESET_PASSWORD_PATH, appUrl);
  url.searchParams.set("token", token);
  return url.toString();
}

export function buildPasswordResetEmail({ to, appUrl, token }: PasswordResetEmailInput): MailMessage {
  const { html, text } = renderEmail({
    greeting: "Bonjour,",
    paragraphs: [
      "Vous avez demandé à réinitialiser le mot de passe de votre espace bénévole du Salon de la Danse.",
    ],
    action: { label: "Choisir un nouveau mot de passe", url: buildPasswordResetUrl(appUrl, token) },
    footnote: `Ce lien est valable ${PASSWORD_RESET_TOKEN_TTL_MINUTES} minutes. Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail : votre mot de passe reste inchangé.`,
  });

  return {
    to,
    subject: "Réinitialisation de votre mot de passe · Salon de la Danse",
    text,
    html,
  };
}
