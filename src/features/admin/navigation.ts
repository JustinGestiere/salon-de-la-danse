import type { FluentIconName } from "@/components/ui/fluent-icon-data";
import { ADMIN_HOME_PATH, getSafeRedirectPath } from "@/features/auth/redirects";

export type AdminNavLink = {
  href: string;
  label: string;
  icon: FluentIconName;
};

/// Connexion propre à la régie, dans le thème du back-office.
export const ADMIN_LOGIN_PATH = "/admin/connexion";
export const ADMIN_SETTINGS_HREF = "/admin/reglages";

export const ADMIN_NAV_LINKS: readonly AdminNavLink[] = [
  { href: ADMIN_HOME_PATH, label: "Vue d'ensemble", icon: "home" },
  { href: "/admin/benevoles", label: "Bénévoles", icon: "people-team" },
  { href: "/admin/planning", label: "Planning", icon: "calendar" },
  { href: "/admin/invitations", label: "Invitations", icon: "mail" },
  { href: "/admin/badges", label: "Badges", icon: "contact-card" },
  { href: "/admin/journal", label: "Journal", icon: "history" },
];

/// Page où renvoyer l'admin après sa connexion. En plus du filtre anti
/// redirection externe, seule une page du back-office est acceptée : pas
/// l'espace bénévole, ni la page de connexion elle-même.
export function resolveAdminRedirect(requestedPath: string | undefined): string {
  const safePath = getSafeRedirectPath(requestedPath ?? null, ADMIN_HOME_PATH);
  const isBackOfficePage = safePath.startsWith("/admin/") && !safePath.startsWith(ADMIN_LOGIN_PATH);
  return isBackOfficePage ? safePath : ADMIN_HOME_PATH;
}
