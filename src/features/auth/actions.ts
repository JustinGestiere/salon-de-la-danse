"use server";

import { headers } from "next/headers";
import { after } from "next/server";

import { isDomainError } from "@/lib/errors";
import { fail, ok, type ActionResult } from "@/lib/result";
import {
  REGISTRATION_MAX_ATTEMPTS,
  REGISTRATION_WINDOW_MINUTES,
} from "@/features/auth/constants";
import { createRateLimiter, getClientIp } from "@/features/auth/rate-limit";
import { photoSchema, registerSchema } from "@/features/auth/schemas";
import { registerVolunteer } from "@/features/auth/service";
import { sendWelcomeEmail } from "@/features/notifications/service";

const MS_PER_MINUTE = 60_000;

const registrationLimiter = createRateLimiter({
  maxAttempts: REGISTRATION_MAX_ATTEMPTS,
  windowMs: REGISTRATION_WINDOW_MINUTES * MS_PER_MINUTE,
});

function toBoolean(value: FormDataEntryValue | null): boolean {
  return value === "on" || value === "true";
}

/// Server Action d'inscription. Ordre imposé : limitation, validation Zod, puis
/// service. Une Server Action est un endpoint public : rien n'est présumé de
/// l'appelant.
export async function registerAction(
  formData: FormData,
): Promise<ActionResult<{ volunteerId: string }>> {
  // Avant toute validation : chaque tentative compte, y compris les codes
  // d'invitation inventés qu'un attaquant essaierait en série.
  const clientIp = getClientIp(await headers());
  if (!registrationLimiter.tryConsume(clientIp)) {
    return fail(
      "rateLimit.exceeded",
      `Trop de tentatives. Réessayez dans ${REGISTRATION_WINDOW_MINUTES} minutes.`,
    );
  }

  const parsed = registerSchema.safeParse({
    invitationCode: formData.get("invitationCode"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    birthDate: formData.get("birthDate") ?? "",
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    acceptTerms: toBoolean(formData.get("acceptTerms")),
  });

  if (!parsed.success) {
    return fail(
      "validation",
      "Veuillez corriger les champs indiqués.",
      toFieldErrors(parsed.error),
    );
  }

  const photoParsed = photoSchema.safeParse(formData.get("photo"));
  if (!photoParsed.success) {
    return fail("validation", "Photo d'identité invalide.", {
      photo: photoParsed.error.issues.map((issue) => issue.message),
    });
  }

  try {
    const result = await registerVolunteer(parsed.data, photoParsed.data);
    // Envoyé après la réponse : l'inscription n'attend pas le serveur SMTP.
    after(() => sendWelcomeEmail(result.volunteerId));
    return ok(result);
  } catch (error) {
    if (isDomainError(error)) {
      return fail(error.code, error.message);
    }
    console.error("[registerAction] erreur inattendue", error);
    return fail(
      "unexpected",
      "Une erreur est survenue. Veuillez réessayer dans un instant.",
    );
  }
}

/// Regroupe les erreurs Zod par champ, pour les afficher sous chaque champ du
/// formulaire.
function toFieldErrors(error: {
  issues: { path: PropertyKey[]; message: string }[];
}): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    (fieldErrors[key] ??= []).push(issue.message);
  }
  return fieldErrors;
}
