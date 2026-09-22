import type { ReactNode } from "react";
import Link from "next/link";

import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { requireAdmin } from "@/features/admin/guards";

const NAV_LINKS = [{ href: "/admin/tableau-de-bord", label: "Tableau de bord" }] as const;

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireAdmin();

  return (
    <div className="min-h-dvh bg-gray-50">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/admin/tableau-de-bord" className="font-bold text-brand-700">
            Salon de la Danse <span className="text-gray-400">· Administration</span>
          </Link>
          <span className="hidden text-sm text-gray-500 sm:inline">
            {user.firstName} {user.lastName}
          </span>
          <SignOutButton />
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-2 pb-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-brand-50 hover:text-brand-700"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
