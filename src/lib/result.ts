/// Resultat typé renvoyé par toutes les Server Actions. Le front reçoit un
/// code d'erreur stable plutôt qu'un message à parser.
export type ActionError = {
  code: string;
  message: string;
  /// Erreurs de validation champ par champ, pour l'affichage dans le formulaire.
  fieldErrors?: Record<string, string[]>;
};

export type ActionResult<TData = undefined> =
  | { ok: true; data: TData }
  | { ok: false; error: ActionError };

export function ok<TData>(data: TData): { ok: true; data: TData } {
  return { ok: true, data };
}

export function fail(
  code: string,
  message: string,
  fieldErrors?: Record<string, string[]>,
): { ok: false; error: ActionError } {
  return { ok: false, error: { code, message, fieldErrors } };
}
