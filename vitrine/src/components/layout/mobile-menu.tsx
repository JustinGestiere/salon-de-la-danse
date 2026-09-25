"use client";

import { useState } from "react";

import { NavLinks } from "@/components/layout/nav-links";
import { ThemeToggle } from "@/features/theme/components/theme-toggle";
import type { SiteTheme } from "@/features/theme/theme";

/// Menu des petits écrans : un panneau sous la barre, refermé à chaque clic.
export function MobileMenu({ theme }: { theme: SiteTheme }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="menu-mobile"
        onClick={() => setIsOpen((open) => !open)}
        className="grid size-11 place-items-center rounded-full border border-line-strong text-ink"
      >
        <span className="sr-only">{isOpen ? "Fermer le menu" : "Ouvrir le menu"}</span>
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden="true">
          <path d={isOpen ? "M6 6l12 12M18 6L6 18" : "M4 7h16M4 12h16M4 17h16"} />
        </svg>
      </button>
      {isOpen ? (
        <nav id="menu-mobile" aria-label="Navigation principale" className="absolute inset-x-0 top-full border-b border-line bg-canvas px-4 pb-6 pt-2 sm:px-8">
          <NavLinks onNavigate={() => setIsOpen(false)} className="flex flex-col gap-1 text-lg [&_a]:block [&_a]:py-3" />
          <div className="mt-3 flex items-center gap-3 border-t border-line pt-4 text-muted sm:hidden">
            <ThemeToggle theme={theme} />
            <span>Clair ou sombre</span>
          </div>
        </nav>
      ) : null}
    </div>
  );
}
