import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { cookies } from "next/headers";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { THEME_FONT_VARIABLES } from "@/lib/fonts";
import { SITE_THEME_COOKIE, parseSiteTheme } from "@/features/theme/theme";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Salon de la Danse d'Angers, 14 au 16 mai 2027",
    template: "%s · Salon de la Danse d'Angers",
  },
  description:
    "Trois jours pour regarder, essayer et apprendre toutes les danses : démonstrations, initiations, masterclass et invités au Centre de Congrès d'Angers.",
};

export const viewport: Viewport = {
  themeColor: "#120a1e",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const cookieStore = await cookies();
  const theme = parseSiteTheme(cookieStore.get(SITE_THEME_COOKIE)?.value);

  return (
    <html lang="fr" data-theme={theme} className={THEME_FONT_VARIABLES}>
      <body className="flex min-h-dvh flex-col font-sans antialiased">
        <a
          href="#contenu"
          className="sr-only rounded-full bg-surface px-4 py-2 text-sm focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50"
        >
          Aller au contenu
        </a>
        <SiteHeader theme={theme} />
        <main id="contenu" className="relative flex-1 overflow-x-clip">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
