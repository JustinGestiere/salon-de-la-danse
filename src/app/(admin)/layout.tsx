import type { ReactNode } from "react";
import { cookies } from "next/headers";

import { requireAdmin } from "@/features/admin/guards";
import { AdminTopBar } from "@/features/admin/components/admin-top-bar";
import { ADMIN_FONT_VARIABLES } from "@/features/admin/fonts";
import { ADMIN_THEME_COOKIE, parseAdminTheme } from "@/features/admin/theme";
import { getActiveEdition, isRegistrationOpen } from "@/features/editions/queries";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireAdmin();
  const [edition, cookieStore] = await Promise.all([getActiveEdition(), cookies()]);
  const theme = parseAdminTheme(cookieStore.get(ADMIN_THEME_COOKIE)?.value);

  return (
    <div data-theme={theme} className={`admin-theme ${ADMIN_FONT_VARIABLES} min-h-dvh font-admin`}>
      <a
        href="#contenu"
        className="sr-only rounded-full bg-surface px-4 py-2 text-sm focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-30"
      >
        Aller au contenu
      </a>
      <AdminTopBar
        adminName={`${user.firstName} ${user.lastName}`}
        initials={`${user.firstName.charAt(0)}${user.lastName.charAt(0)}`}
        editionName={edition?.name ?? null}
        isRegistrationOpen={edition ? isRegistrationOpen(edition) : false}
        theme={theme}
      />
      <main id="contenu" className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-8 lg:px-14 lg:py-10">
        {children}
      </main>
    </div>
  );
}
