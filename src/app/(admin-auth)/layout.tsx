import type { ReactNode } from "react";
import { cookies } from "next/headers";
import Link from "next/link";

import { THEME_FONT_VARIABLES } from "@/lib/fonts";
import { ADMIN_THEME_COOKIE, parseAdminTheme } from "@/features/admin/theme";

/// Entrée de la régie : même thème que le back-office (clair ou sombre selon
/// le choix mémorisé), sans la barre de navigation réservée aux connectés.
export default async function AdminAuthLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const theme = parseAdminTheme(cookieStore.get(ADMIN_THEME_COOKIE)?.value);

  return (
    <div data-theme={theme} className={`admin-theme ${THEME_FONT_VARIABLES} relative min-h-dvh overflow-hidden font-admin`}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-48 size-[640px] rounded-full bg-[radial-gradient(circle,var(--admin-glow)_0%,transparent_68%)]"
      />
      <main className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-8 px-4 py-12">
        <header className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-subtle">La régie</p>
          <p className="font-display text-5xl leading-none text-ink">
            Salon de la <em className="text-accent">Danse</em>
          </p>
          <p className="text-sm text-muted">Accès réservé à l'équipe d'organisation.</p>
        </header>
        <section className="rounded-[28px] border border-line bg-surface p-7 shadow-[0_30px_80px_rgb(0_0_0/0.18)]">
          {children}
        </section>
        <p className="text-sm text-muted">
          Vous êtes bénévole ?{" "}
          <Link href="/connexion" className="font-medium text-accent underline-offset-4 hover:underline">
            Espace bénévole →
          </Link>
        </p>
      </main>
    </div>
  );
}
