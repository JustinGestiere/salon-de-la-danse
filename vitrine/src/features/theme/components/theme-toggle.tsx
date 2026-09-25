"use client";

import { useOptimistic, useTransition } from "react";

import { setSiteThemeAction } from "@/features/theme/actions";
import { SITE_THEME_LABELS, getNextSiteTheme, type SiteTheme } from "@/features/theme/theme";

const ICON_PATHS: Record<SiteTheme, string> = {
  system: "M4 5h16v11H4zM2 19h20",
  light: "M12 3v2M12 19v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M3 12h2M19 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
  dark: "M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z",
};

type ThemeToggleProps = {
  theme: SiteTheme;
};

/// Bascule système → clair → sombre. L'affichage change tout de suite, le
/// cookie suit en arrière-plan.
export function ThemeToggle({ theme }: ThemeToggleProps) {
  const [optimisticTheme, setOptimisticTheme] = useOptimistic(theme);
  const [isPending, startTransition] = useTransition();
  const nextTheme = getNextSiteTheme(optimisticTheme);

  function toggle(): void {
    startTransition(async () => {
      setOptimisticTheme(nextTheme);
      document.documentElement.setAttribute("data-theme", nextTheme);
      const result = await setSiteThemeAction(nextTheme);
      if (!result.ok) console.error("[ThemeToggle]", result.error.code);
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      aria-label={`${SITE_THEME_LABELS[optimisticTheme]}. Passer au ${SITE_THEME_LABELS[nextTheme].toLowerCase()}`}
      title={SITE_THEME_LABELS[optimisticTheme]}
      className="grid size-11 shrink-0 place-items-center rounded-full border border-line-strong text-muted transition hover:bg-raised hover:text-ink"
    >
      <svg
        viewBox="0 0 24 24"
        className="size-[18px]"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d={ICON_PATHS[optimisticTheme]} />
      </svg>
    </button>
  );
}
