export type AdminNavLink = {
  href: string;
  label: string;
};

export const ADMIN_NAV_LINKS: readonly AdminNavLink[] = [
  { href: "/admin/tableau-de-bord", label: "Vue d'ensemble" },
  { href: "/admin/benevoles", label: "Bénévoles" },
  { href: "/admin/planning", label: "Planning" },
  { href: "/admin/invitations", label: "Invitations" },
  { href: "/admin/badges", label: "Badges" },
  { href: "/admin/journal", label: "Journal" },
];

export const ADMIN_SETTINGS_HREF = "/admin/reglages";
