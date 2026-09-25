export type NavItem = {
  href: string;
  label: string;
};

export const TICKETS_HREF = "/billetterie";
export const WHY_NOT_YOU_HREF = "/pourquoi-pas-vous";

/// Navigation principale, dans l'ordre d'affichage.
export const MAIN_NAV_ITEMS: readonly NavItem[] = [
  { href: "/le-salon", label: "Le Salon" },
  { href: "/programme", label: "Programme" },
  { href: "/invites", label: "Invités" },
  { href: WHY_NOT_YOU_HREF, label: "Pourquoi pas vous ?" },
  { href: "/exposants", label: "Exposants" },
  { href: "/infos-pratiques", label: "Infos pratiques" },
];

export const FOOTER_NAV_GROUPS: readonly { title: string; items: readonly NavItem[] }[] = [
  {
    title: "Le Salon",
    items: [
      { href: "/programme", label: "Programme" },
      { href: "/invites", label: "Invités" },
      { href: "/exposants", label: "Exposants" },
      { href: "/partenaires", label: "Partenaires" },
    ],
  },
  {
    title: "Venir",
    items: [
      { href: "/infos-pratiques", label: "Infos pratiques" },
      { href: TICKETS_HREF, label: "Billetterie" },
      { href: WHY_NOT_YOU_HREF, label: "Pourquoi pas vous ?" },
      { href: "/mentions-legales", label: "Mentions légales" },
    ],
  },
];

/// Une rubrique reste active sur ses sous-pages (/billetterie/merci).
export function isNavItemActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
