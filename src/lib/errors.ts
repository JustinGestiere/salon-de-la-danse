/// Erreur métier attendue (validation, droits, ressource introuvable). Les
/// Server Actions la traduisent en résultat typé ; une erreur inattendue, elle,
/// est loggée et masquée derrière un message générique.
export class DomainError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "DomainError";
    this.code = code;
  }
}

export function isDomainError(error: unknown): error is DomainError {
  return error instanceof DomainError;
}
