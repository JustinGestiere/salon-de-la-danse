"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { AdminSelect } from "@/components/admin/admin-select";
import { ADMIN_INPUT_CLASS } from "@/components/admin/input-styles";
import type { VolunteerStatusCounts } from "@/features/volunteers/admin-queries";
import { VOLUNTEER_STATUS_DOTS } from "@/features/volunteers/components/status-display";
import { VOLUNTEER_STATUSES, VOLUNTEER_STATUS_LABELS } from "@/features/volunteers/status";

const VOLUNTEERS_PATH = "/admin/benevoles";

type Option = { value: string; label: string };

type VolunteerFilterBarProps = {
  counts: VolunteerStatusCounts;
  missions: readonly Option[];
  days: readonly Option[];
};

export function VolunteerFilterBar({ counts, missions, days }: VolunteerFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeStatus = searchParams.get("statut") ?? "";

  /// Un changement de filtre repart de la première page.
  function update(key: string, value: string): void {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.replace(`${VOLUNTEERS_PATH}?${params.toString()}`, { scroll: false });
  }

  const chips = [
    { value: "", label: "Tous", count: counts.all, dot: "bg-ink" },
    ...VOLUNTEER_STATUSES.map((status) => ({
      value: status,
      label: VOLUNTEER_STATUS_LABELS[status],
      count: counts[status],
      dot: VOLUNTEER_STATUS_DOTS[status],
    })),
    ...(counts.minor > 0 || activeStatus === "minor"
      ? [{ value: "minor", label: "Mineurs à valider", count: counts.minor, dot: "bg-danger" }]
      : []),
  ];

  return (
    <div className="flex flex-col gap-3">
      <label className="sr-only" htmlFor="volunteer-search">
        Rechercher un bénévole
      </label>
      <input
        id="volunteer-search"
        type="search"
        defaultValue={searchParams.get("q") ?? ""}
        onChange={(event) => update("q", event.target.value)}
        placeholder="Nom, e-mail ou numéro de badge"
        className={`${ADMIN_INPUT_CLASS} rounded-full border-line`}
      />
      <div className="grid grid-cols-2 gap-3">
        <AdminSelect
          label="Mission"
          value={searchParams.get("mission") ?? ""}
          onChange={(event) => update("mission", event.target.value)}
        >
          <option value="">Toutes les missions</option>
          {missions.map((mission) => (
            <option key={mission.value} value={mission.value}>
              {mission.label}
            </option>
          ))}
        </AdminSelect>
        <AdminSelect
          label="Jour"
          value={searchParams.get("jour") ?? ""}
          onChange={(event) => update("jour", event.target.value)}
        >
          <option value="">Tous les jours</option>
          {days.map((day) => (
            <option key={day.value} value={day.value}>
              {day.label}
            </option>
          ))}
        </AdminSelect>
      </div>
      <div role="group" aria-label="Filtrer par statut" className="flex flex-wrap gap-2">
        {chips.map((chip) => {
          const isActive = activeStatus === chip.value;
          return (
            <button
              key={chip.value || "all"}
              type="button"
              aria-pressed={isActive}
              onClick={() => update("statut", chip.value)}
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
