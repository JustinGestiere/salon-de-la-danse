"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { MAIN_NAV_ITEMS, isNavItemActive } from "@/components/layout/navigation";

type NavLinksProps = {
  className?: string;
  /// Appelé au clic, pour refermer le menu mobile.
  onNavigate?: () => void;
};

export function NavLinks({ className = "", onNavigate }: NavLinksProps) {
  const pathname = usePathname();

  return (
    <ul className={className}>
      {MAIN_NAV_ITEMS.map((item) => {
        const isActive = isNavItemActive(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={`transition hover:text-ink ${isActive ? "text-accent underline decoration-1 underline-offset-8" : "text-ink-soft"}`}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
