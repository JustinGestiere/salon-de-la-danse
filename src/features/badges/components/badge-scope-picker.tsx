import Link from "next/link";

import { BADGE_SCOPES, BADGE_SCOPE_LABELS, type BadgeScope } from "@/features/badges/schemas";
import type { BadgeScopeCounts } from "@/features/badges/queries";

type BadgeScopePickerProps = {
  activeScope: BadgeScope;
  counts: BadgeScopeCounts;
};

/// Choix du périmètre d'impression. L'état vit dans l'URL : chaque option est
/// un lien, la page se recharge avec le bon aperçu.
export function BadgeScopePicker({ activeScope, counts }: BadgeScopePickerProps) {
  return (
    <nav aria-labelledby="scope-title" className="flex flex-col gap-2">
      <h2 id="scope-title" className="pb-2 font-display text-2xl text-ink">
        Qui imprimer ?
      </h2>
      {BADGE_SCOPES.map((scope) => {
        const isActive = scope === activeScope;
        const count = scope === "selection" ? null : counts[scope];
        return (
          <Link
            key={scope}
            href={`/admin/badges?perimetre=${scope}`}
            aria-current={isActive ? "page" : undefined}
            scroll={false}
            className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 transition ${
              isActive ? "border-accent bg-raised" : "border-line hover:bg-raised/60"
            }`}
          >
            <span
              aria-hidden="true"
              className={`grid size-[18px] place-items-center rounded-full border-2 ${isActive ? "border-accent" : "border-line-strong"}`}
            >
              {isActive ? <span className="size-2 rounded-full bg-accent" /> : null}
            </span>
            <span className="flex flex-1 flex-col gap-0.5">
              <span className="text-sm font-semibold text-ink">{BADGE_SCOPE_LABELS[scope].label}</span>
              <span className="text-xs text-subtle">{BADGE_SCOPE_LABELS[scope].hint}</span>
            </span>
            {count !== null ? (
              <span className={`font-display text-3xl ${isActive ? "text-accent-strong" : "text-muted"}`}>{count}</span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
