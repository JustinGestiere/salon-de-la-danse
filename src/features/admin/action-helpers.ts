import "server-only";

import { isDomainError } from "@/lib/errors";
import { fail, ok, type ActionResult } from "@/lib/result";

/// Exécute l'opération d'une Server Action du back-office et traduit ses
/// erreurs : une erreur métier devient un résultat typé, une erreur inattendue
/// est loggée avec son contexte et masquée derrière un message générique.
export async function runAdminOperation<TData>(
  label: string,
  operation: () => Promise<TData>,
): Promise<ActionResult<TData>> {
  try {
    return ok(await operation());
  } catch (error) {
    if (isDomainError(error)) return fail(error.code, error.message);
    console.error(`[${label}] erreur inattendue`, error);
    return fail("unexpected", "Une erreur est survenue. Réessayez.");
  }
}

export const ADMIN_FORBIDDEN_MESSAGE = "Action réservée à un administrateur.";
