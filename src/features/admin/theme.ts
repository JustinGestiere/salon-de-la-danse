import { z } from "zod";

/// Préférence d'affichage du back-office. « system » suit le réglage clair ou
/// sombre de l'ordinateur ; c'est la valeur par défaut.
export const ADMIN_THEMES = ["system", "light", "dark"] as const;
export type AdminTheme = (typeof ADMIN_THEMES)[number];

export const ADMIN_THEME_COOKIE = "admin-theme";

/// Un an : la préférence d'affichage n'a pas de raison d'expirer plus tôt.
export const ADMIN_THEME_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export const ADMIN_THEME_LABELS: Record<AdminTheme, string> = {
  system: "Thème du système",
  light: "Thème clair",
  dark: "Thème sombre",
};

export const adminThemeSchema = z.enum(ADMIN_THEMES);

/// Le cookie vient du navigateur : une valeur inconnue retombe sur « system ».
export function parseAdminTheme(value: string | undefined): AdminTheme {
  const parsed = adminThemeSchema.safeParse(value);
  return parsed.success ? parsed.data : "system";
}

/// Ordre du bouton de bascule : système, clair, sombre, puis retour.
export function getNextAdminTheme(current: AdminTheme): AdminTheme {
  const index = ADMIN_THEMES.indexOf(current);
  return ADMIN_THEMES[(index + 1) % ADMIN_THEMES.length] ?? "system";
}
