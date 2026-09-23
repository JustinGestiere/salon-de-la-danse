import type { ReactNode } from "react";

import { requireAdmin } from "@/features/admin/guards";
import { THEME_FONT_VARIABLES } from "@/lib/fonts";

/// Impressions de la régie (listes, badges) : toujours en clair, sans la barre
/// de navigation. Même garde que le back-office.
export default async function AdminPrintLayout({ children }: { children: ReactNode }) {
  await requireAdmin();

  return (
    <div data-theme="light" className={`admin-theme admin-print-root ${THEME_FONT_VARIABLES} min-h-dvh font-admin`}>
      {children}
    </div>
  );
}
