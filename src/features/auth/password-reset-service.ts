import "server-only";

import { isAPIError } from "better-auth/api";

import { auth } from "@/lib/auth";
import { DomainError } from "@/lib/errors";
import { isMailerConfigured } from "@/lib/mailer";
import type { PasswordResetInput } from "@/features/auth/schemas";

/// Déclenche l'envoi du lien. La réponse est la même, qu'un compte existe ou
/// non pour cette adresse.
export async function requestPasswordReset(email: string): Promise<void> {
  if (!isMailerConfigured()) {
    throw new DomainError(
      "mail.unavailable",
      "La réinitialisation par e-mail est indisponible pour le moment. Contactez l'équipe d'organisation.",
    );
  }
  await auth.api.requestPasswordReset({ body: { email } });
}

/// Enregistre le nouveau mot de passe si le jeton est valide et non expiré.
/// Better Auth consomme le jeton et ferme les sessions ouvertes du compte.
export async function resetPassword({ token, password }: PasswordResetInput): Promise<void> {
  try {
    await auth.api.resetPassword({ body: { token, newPassword: password } });
  } catch (error) {
    if (isAPIError(error) && error.body?.code === "INVALID_TOKEN") {
      throw new DomainError(
        "auth.invalidResetToken",
        "Ce lien n'est plus valide. Demandez-en un nouveau depuis la page de connexion.",
      );
    }
    throw error;
  }
}
