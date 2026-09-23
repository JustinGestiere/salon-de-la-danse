"use server";

import { headers } from "next/headers";

import { isDomainError } from "@/lib/errors";
import { toFieldErrors } from "@/lib/field-errors";
import { fail, ok, type ActionResult } from "@/lib/result";
import {
  PASSWORD_RESET_MAX_ATTEMPTS,
  PASSWORD_RESET_WINDOW_MINUTES,
} from "@/features/auth/constants";
import { requestPasswordReset, resetPassword } from "@/features/auth/password-reset-service";
import { createRateLimiter, getClientIp } from "@/features/auth/rate-limit";
import { passwordResetRequestSchema, passwordResetSchema } from "@/features/auth/schemas";

const MS_PER_MINUTE = 60_000;

// Deux compteurs distincts : demander un lien puis s'en servir ne doit pas
// consommer le même quota.
const passwordResetRequestLimiter = createRateLimiter({
  maxAttempts: PASSWORD_RESET_MAX_ATTEMPTS,
  windowMs: PASSWORD_RESET_WINDOW_MINUTES * MS_PER_MINUTE,
});

const passwordResetLimiter = createRateLimiter({
  maxAttempts: PASSWORD_RESET_MAX_ATTEMPTS,
  windowMs: PASSWORD_RESET_WINDOW_MINUTES * MS_PER_MINUTE,
});

const RATE_LIMIT_MESSAGE = `Trop de tentatives. Réessayez dans ${PASSWORD_RESET_WINDOW_MINUTES} minutes.`;
const VALIDATION_MESSAGE = "Veuillez corriger les champs indiqués.";
const UNEXPECTED_ERROR_MESSAGE = "Une erreur est survenue. Veuillez réessayer dans un instant.";

/// Demande d'un lien de réinitialisation. Server Action publique : la réponse
/// est identique qu'un compte existe ou non, pour ne pas révéler les adresses
/// inscrites.
export async function requestPasswordResetAction(input: unknown): Promise<ActionResult> {
  const clientIp = getClientIp(await headers());
  if (!passwordResetRequestLimiter.tryConsume(clientIp)) {
    return fail("rateLimit.exceeded", RATE_LIMIT_MESSAGE);
  }

  const parsed = passwordResetRequestSchema.safeParse(input);
  if (!parsed.success) {
    return fail("validation", VALIDATION_MESSAGE, toFieldErrors(parsed.error.issues));
  }

  try {
    await requestPasswordReset(parsed.data.email);
    return ok(undefined);
  } catch (error) {
    if (isDomainError(error)) return fail(error.code, error.message);
    console.error("[requestPasswordResetAction] erreur inattendue", error);
    return fail("unexpected", UNEXPECTED_ERROR_MESSAGE);
  }
}

/// Choix du nouveau mot de passe depuis le lien reçu par e-mail. Le jeton fait
/// office d'authentification : aucune session n'est requise.
export async function resetPasswordAction(input: unknown): Promise<ActionResult> {
  const clientIp = getClientIp(await headers());
  if (!passwordResetLimiter.tryConsume(clientIp)) {
    return fail("rateLimit.exceeded", RATE_LIMIT_MESSAGE);
  }

  const parsed = passwordResetSchema.safeParse(input);
  if (!parsed.success) {
    return fail("validation", VALIDATION_MESSAGE, toFieldErrors(parsed.error.issues));
  }

  try {
    await resetPassword(parsed.data);
    return ok(undefined);
  } catch (error) {
    if (isDomainError(error)) return fail(error.code, error.message);
    console.error("[resetPasswordAction] erreur inattendue", error);
    return fail("unexpected", UNEXPECTED_ERROR_MESSAGE);
  }
}
