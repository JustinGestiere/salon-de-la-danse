import "server-only";

import { env } from "@/lib/env";
import { sendMail } from "@/lib/mailer";
import { buildPasswordResetEmail } from "@/features/auth/password-reset-email";

type PasswordResetRecipient = {
  userId: string;
  email: string;
  token: string;
};

/// Appelée par Better Auth quand un compte correspond à l'adresse demandée.
/// Un échec d'envoi est loggé sans être remonté : l'appelant recevrait sinon
/// une erreur pour les seules adresses inscrites, ce qui les trahirait.
export async function sendPasswordResetEmail({ userId, email, token }: PasswordResetRecipient): Promise<void> {
  try {
    await sendMail(buildPasswordResetEmail({ to: email, appUrl: env.NEXT_PUBLIC_APP_URL, token }));
  } catch (error) {
    console.error("[sendPasswordResetEmail] envoi impossible", { userId, error });
  }
}
