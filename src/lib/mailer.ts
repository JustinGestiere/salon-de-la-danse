import "server-only";

import { createTransport } from "nodemailer";

import { env } from "@/lib/env";

export type MailMessage = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

/// Port du SMTP chiffré dès la connexion (OVH : 465). Les autres ports
/// (587, 1025 de Mailpit) passent en chiffrement négocié ou en clair.
const SMTPS_PORT = 465;

// Une seule connexion SMTP configurée pour toute l'application, créée au
// premier import comme le client Prisma. Identifiants facultatifs : un piège à
// e-mails local n'en demande pas.
const transporter =
  env.SMTP_HOST && env.SMTP_PORT
    ? createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === SMTPS_PORT,
        auth:
          env.SMTP_USER && env.SMTP_PASSWORD
            ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD }
            : undefined,
      })
    : null;

export function isMailerConfigured(): boolean {
  return transporter !== null && Boolean(env.MAIL_FROM);
}

/// Envoie un e-mail depuis l'adresse de l'application. Lève une erreur si
/// l'envoi n'est pas configuré ou si le serveur SMTP refuse le message.
export async function sendMail(message: MailMessage): Promise<void> {
  if (!transporter || !env.MAIL_FROM) {
    throw new Error("Envoi d'e-mails non configuré (SMTP_HOST, SMTP_PORT, MAIL_FROM).");
  }
  await transporter.sendMail({ from: env.MAIL_FROM, ...message });
}
