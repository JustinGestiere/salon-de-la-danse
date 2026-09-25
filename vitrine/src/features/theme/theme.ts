import { z } from "zod";

/// Préférence d'affichage du visiteur. « system » suit le réglage clair ou
/// sombre de l'appareil ; c'est la valeur par défaut.
export const SITE_THEMES = ["system", "light", "dark"] as const;
export type SiteTheme = (typeof SITE_THEMES)[number];

export const SITE_THEME_COOKIE = "site-theme";

/// Un an : la préférence d'affichage n'a pas de raison d'expirer plus tôt.
export const SITE_THEME_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export const SITE_THEME_LABELS: Record<SiteTheme, string> = {
  system: "Thème du système",
  light: "Thème clair",
  dark: "Thème sombre",
};

export const siteThemeSchema = z.enum(SITE_THEMES);

/// Le cookie vient du navigateur : une valeur inconnue retombe sur « system ».
export function parseSiteTheme(value: string | undefined): SiteTheme {
  const parsed = siteThemeSchema.safeParse(value);
  return parsed.success ? parsed.data : "system";
}

/// Ordre du bouton de bascule : système, clair, sombre, puis retour.
export function getNextSiteTheme(current: SiteTheme): SiteTheme {
  const index = SITE_THEMES.indexOf(current);
  return SITE_THEMES[(index + 1) % SITE_THEMES.length] ?? "system";
}
