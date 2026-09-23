import type { MailMessage } from "@/lib/mailer";
import { PASSWORD_RESET_TOKEN_TTL_MINUTES } from "@/features/auth/constants";
import { RESET_PASSWORD_PATH } from "@/features/auth/redirects";

type PasswordResetEmailInput = {
  to: string;
  appUrl: string;
  token: string;
};

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => HTML_ESCAPES[character] ?? character);
}

/// Lien vers notre propre page de réinitialisation. On n'utilise pas l'URL
/// fournie par Better Auth : elle passe par une redirection de son API alors
/// que le jeton suffit à notre formulaire.
export function buildPasswordResetUrl(appUrl: string, token: string): string {
  const url = new URL(RESET_PASSWORD_PATH, appUrl);
  url.searchParams.set("token", token);
  return url.toString();
}

export function buildPasswordResetEmail({ to, appUrl, token }: PasswordResetEmailInput): MailMessage {
  const resetUrl = buildPasswordResetUrl(appUrl, token);
  const validity = `${PASSWORD_RESET_TOKEN_TTL_MINUTES} minutes`;

  const text = [
    "Bonjour,",
    "",
    "Vous avez demandé à réinitialiser le mot de passe de votre espace bénévole du Salon de la Danse.",
    `Choisissez-en un nouveau en ouvrant ce lien (valable ${validity}) :`,
    resetUrl,
    "",
    "Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail : votre mot de passe reste inchangé.",
  ].join("\n");

  const html = `<p>Bonjour,</p>
<p>Vous avez demandé à réinitialiser le mot de passe de votre espace bénévole du Salon de la Danse.</p>
<p><a href="${escapeHtml(resetUrl)}">Choisir un nouveau mot de passe</a> (lien valable ${validity}).</p>
<p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail : votre mot de passe reste inchangé.</p>`;

  return {
    to,
    subject: "Réinitialisation de votre mot de passe · Salon de la Danse",
    text,
    html,
  };
}
