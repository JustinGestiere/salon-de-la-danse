"use client";

import { useOptimistic, useTransition } from "react";

import { FluentIcon } from "@/components/ui/fluent-icon";
import { setAdminThemeAction } from "@/features/admin/actions";
import {
  ADMIN_THEME_LABELS,
  getNextAdminTheme,
  type AdminTheme,
} from "@/features/admin/theme";

// Le jeu Fluent Color n'a pas de lune : le thème sombre garde son icône au trait.
const MOON_PATH = "M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z";

function ThemeIcon({ theme }: { theme: AdminTheme }) {
  if (theme === "system") return <FluentIcon name="laptop" className="size-5" />;
  if (theme === "light") return <FluentIcon name="weather-sunny-low" className="size-5" />;
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={MOON_PATH} />
    </svg>
  );
}

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
      <ThemeIcon theme={optimisticTheme} />
    </button>
  );
}
