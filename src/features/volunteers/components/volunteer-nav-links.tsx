"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { FluentIcon } from "@/components/ui/fluent-icon";

const VOLUNTEER_NAV_LINKS = [
  { href: "/tableau-de-bord", label: "Tableau de bord", icon: "home" },
  { href: "/planning", label: "Planning", icon: "calendar" },
  { href: "/recapitulatif", label: "Mon récap", icon: "clipboard-task" },
] as const;

/// Seul morceau client de la barre : il lui faut l'URL courante pour marquer
/// l'onglet actif.
export function VolunteerNavLinks() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navigation principale" className="-mx-1 flex gap-1 overflow-x-auto">
      {VOLUNTEER_NAV_LINKS.map((link) => {
        const isActive = pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? "page" : undefined}
            className={`relative flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap px-2.5 text-sm transition ${
              isActive ? "font-semibold text-ink" : "text-muted hover:text-ink"
            }`}
          >
            <FluentIcon name={link.icon} className="size-[18px]" />
            {link.label}
            <span
              aria-hidden="true"
              className={`absolute inset-x-2.5 -bottom-px h-0.5 rounded-full ${isActive ? "bg-sunset" : "bg-transparent"}`}
            />
          </Link>
        );
      })}
    </nav>
  );
}
