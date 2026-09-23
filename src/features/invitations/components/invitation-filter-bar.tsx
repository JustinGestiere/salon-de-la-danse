"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { ADMIN_INPUT_CLASS } from "@/components/admin/input-styles";
import {
  INVITATION_STATUSES,
  INVITATION_STATUS_LABELS,
  type InvitationStatus,
} from "@/features/invitations/constants";
import type { InvitationCounts } from "@/features/invitations/queries";

const INVITATIONS_PATH = "/admin/invitations";

const STATUS_DOTS: Record<InvitationStatus, string> = {
  available: "bg-warn",
  used: "bg-ok",
  expired: "bg-danger",
};

type InvitationFilterBarProps = {
  counts: InvitationCounts;
};

export function InvitationFilterBar({ counts }: InvitationFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeStatus = searchParams.get("status") ?? "";

  /// Tout changement de filtre repart de la première page : rester en page 4
  /// après avoir réduit le jeu de résultats affiche une liste vide.
  function update(key: string, value: string): void {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.replace(`${INVITATIONS_PATH}?${params.toString()}`, { scroll: false });
  }

  const chips: { value: string; label: string; count: number; dot: string }[] = [
    { value: "", label: "Tous", count: counts.total, dot: "bg-ink" },
    ...INVITATION_STATUSES.map((status) => ({
      value: status,
      label: INVITATION_STATUS_LABELS[status],
      count: counts[status],
      dot: STATUS_DOTS[status],
    })),
  ];

  return (
    <div className="flex flex-col gap-3">
      <label className="sr-only" htmlFor="invitation-search">
        Rechercher un code ou une adresse
      </label>
      <input
        id="invitation-search"
        type="search"
        defaultValue={searchParams.get("q") ?? ""}
        onChange={(event) => update("q", event.target.value)}
        placeholder="Rechercher un code ou une adresse"
        className={`${ADMIN_INPUT_CLASS} rounded-full border-line`}
      />
      <div role="group" aria-label="Filtrer par statut" className="flex flex-wrap gap-2">
        {chips.map((chip) => {
          const isActive = activeStatus === chip.value;
          return (
            <button
              key={chip.value || "all"}
              type="button"
              aria-pressed={isActive}
              onClick={() => update("status", chip.value)}
              className={`inline-flex min-h-9 items-center gap-2 rounded-full border px-3.5 text-sm transition ${
                isActive ? "border-accent bg-raised text-ink" : "border-line text-ink-soft hover:border-line-strong"
              }`}
            >
              <span aria-hidden="true" className={`size-1.5 rounded-full ${chip.dot}`} />
              {chip.label}
              <span className="text-xs text-subtle">{chip.count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
