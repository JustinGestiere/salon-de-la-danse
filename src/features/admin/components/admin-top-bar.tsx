import Link from "next/link";

import { FluentIcon } from "@/components/ui/fluent-icon";
import { AdminNavLinks } from "@/features/admin/components/admin-nav-links";
import { AdminSignOutButton } from "@/features/admin/components/admin-sign-out-button";
import { ThemeToggle } from "@/features/admin/components/theme-toggle";
import { ADMIN_SETTINGS_HREF } from "@/features/admin/navigation";
import type { AdminTheme } from "@/features/admin/theme";

type AdminTopBarProps = {
  adminName: string;
  initials: string;
  editionName: string | null;
  isRegistrationOpen: boolean;
  theme: AdminTheme;
};

export function AdminTopBar({
  adminName,
  initials,
  editionName,
  isRegistrationOpen,
  theme,
}: AdminTopBarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-canvas/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-x-8 gap-y-1 px-4 pt-3 sm:px-8 lg:h-[72px] lg:flex-nowrap lg:px-10 lg:pt-0">
        <Link href="/admin/tableau-de-bord" className="flex shrink-0 items-baseline gap-3 text-ink">
          <span className="font-display text-2xl leading-none">
            Salon de la <em className="text-accent">Danse</em>
          </span>
          <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-subtle">Régie</span>
        </Link>

        <div className="order-3 w-full lg:order-none lg:w-auto">
          <AdminNavLinks />
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-4">
          <Link
            href={`${ADMIN_SETTINGS_HREF}?onglet=inscriptions`}
            className="hidden items-center gap-2 whitespace-nowrap text-sm text-muted hover:text-ink xl:flex"
          >
            <span
              aria-hidden="true"
              className={`size-2 rounded-full ${isRegistrationOpen ? "bg-ok shadow-[0_0_0_4px_var(--admin-ok-soft)]" : "bg-danger"}`}
            />
            {isRegistrationOpen ? "Inscriptions ouvertes" : "Inscriptions fermées"}
          </Link>
          {editionName ? (
            <span className="hidden whitespace-nowrap text-sm font-medium text-ink-soft 2xl:inline">{editionName}</span>
          ) : null}
          <Link
            href={ADMIN_SETTINGS_HREF}
            aria-label="Réglages"
            className="grid size-10 place-items-center rounded-full text-muted transition hover:bg-raised hover:text-ink"
          >
            <FluentIcon name="settings" className="size-5" />
          </Link>
          <ThemeToggle theme={theme} />
          <span
            title={adminName}
            className="bg-sunset grid size-9 shrink-0 place-items-center rounded-full text-xs font-semibold text-on-accent"
          >
            {initials}
          </span>
          <AdminSignOutButton />
        </div>
      </div>
    </header>
  );
}
