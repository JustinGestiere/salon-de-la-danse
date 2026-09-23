import type { ReactNode } from "react";

import { THEME_FONT_VARIABLES } from "@/lib/fonts";

/// Entrée de l'espace bénévole : même mise en scène que la connexion de la
/// régie. Le thème suit le réglage clair ou sombre de l'appareil.
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      data-theme="system"
      className={`volunteer-theme ${THEME_FONT_VARIABLES} relative min-h-dvh overflow-hidden font-admin`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-48 size-[640px] rounded-full bg-[radial-gradient(circle,var(--admin-glow)_0%,transparent_68%)]"
      />
      <main className="relative mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center gap-8 px-4 py-12">
        <header className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-subtle">Espace bénévole</p>
          <p className="font-display text-5xl leading-none text-ink">
            Salon de la <em className="text-accent">Danse</em>
          </p>
        </header>
        <section className="rounded-[28px] border border-line bg-surface p-7 shadow-[0_30px_80px_rgb(0_0_0/0.18)]">
          {children}
        </section>
      </main>
    </div>
  );
}
