"use client";

import { useOptimistic, useTransition } from "react";

import { setAdminThemeAction } from "@/features/admin/actions";
import {
  ADMIN_THEME_LABELS,
  getNextAdminTheme,
  type AdminTheme,
} from "@/features/admin/theme";

const ICON_PATHS: Record<AdminTheme, string> = {
  system: "M3 5h18v11H3zM8 20h8M12 16v4",
  light: "M12 4V2M12 22v-2M4.9 4.9 3.5 3.5M20.5 20.5l-1.4-1.4M4 12H2M22 12h-2M4.9 19.1l-1.4 1.4M20.5 3.5l-1.4 1.4M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
  dark: "M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z",
};

/// Bascule système → clair → sombre. L'affichage change tout de suite, le
/// cookie suit en arrière-plan.
export function ThemeToggle({ theme }: { theme: AdminTheme }) {
  const [optimisticTheme, setOptimisticTheme] = useOptimistic(theme);
  const [isPending, startTransition] = useTransition();
  const nextTheme = getNextAdminTheme(optimisticTheme);

  function toggle(): void {
    startTransition(async () => {
      setOptimisticTheme(nextTheme);
      document.querySelector(".admin-theme")?.setAttribute("data-theme", nextTheme);
      const result = await setAdminThemeAction(nextTheme);
      if (!result.ok) console.error("[ThemeToggle]", result.error.code);
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      aria-label={`${ADMIN_THEME_LABELS[optimisticTheme]}. Passer au ${ADMIN_THEME_LABELS[nextTheme].toLowerCase()}`}
      title={ADMIN_THEME_LABELS[optimisticTheme]}
      className="grid size-10 place-items-center rounded-full text-muted transition hover:bg-raised hover:text-ink"
    >
      <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={ICON_PATHS[optimisticTheme]} />
      </svg>
    </button>
  );
}
