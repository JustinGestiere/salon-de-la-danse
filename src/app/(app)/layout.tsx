import type { ReactNode } from "react";
import Link from "next/link";

import { THEME_FONT_VARIABLES } from "@/lib/fonts";
import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { requireSessionUser } from "@/features/auth/guards";
import { VolunteerNavLinks } from "@/features/volunteers/components/volunteer-nav-links";

/// Espace bénévole connecté : thème « crépuscule », qui suit le réglage clair
/// ou sombre de l'appareil.
export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireSessionUser();
  const fullName = `${user.firstName} ${user.lastName}`;
  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;

  return (
    <div data-theme="system" className={`volunteer-theme ${THEME_FONT_VARIABLES} min-h-dvh font-admin`}>
      <a
        href="#contenu"
        className="sr-only rounded-full bg-surface px-4 py-2 text-sm focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-30"
      >
        Aller au contenu
      </a>
      <header className="sticky top-0 z-20 border-b border-line bg-canvas/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl flex-col gap-1 px-4 pt-3">
          <div className="flex items-center gap-3">
            <Link href="/tableau-de-bord" className="flex items-baseline gap-3 text-ink">
              <span className="font-display text-2xl leading-none">
                Salon de la <em className="text-accent">Danse</em>
              </span>
              <span className="hidden text-[11px] font-medium uppercase tracking-[0.18em] text-subtle sm:inline">
                Bénévole
              </span>
            </Link>
            <div className="ml-auto flex items-center gap-2">
              <span
                title={fullName}
                className="bg-sunset grid size-9 shrink-0 place-items-center rounded-full text-xs font-semibold text-on-accent"
              >
                <span aria-hidden="true">{initials}</span>
                <span className="sr-only">{fullName}</span>
              </span>
              <SignOutButton />
            </div>
          </div>
          <VolunteerNavLinks />
        </div>
      </header>
      <main id="contenu" className="mx-auto w-full max-w-3xl px-4 py-8">
        {children}
      </main>
    </div>
  );
}
