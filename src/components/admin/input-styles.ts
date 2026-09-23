/// Style commun des champs de saisie du back-office.
export const ADMIN_INPUT_CLASS =
  "min-h-11 w-full rounded-2xl border bg-canvas px-4 py-2 text-sm text-ink placeholder:text-subtle disabled:opacity-60";

export function adminInputClass(hasError: boolean, className = ""): string {
  return `${ADMIN_INPUT_CLASS} ${hasError ? "border-danger" : "border-line-strong"} ${className}`;
}
