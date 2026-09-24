"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { FluentIcon } from "@/components/ui/fluent-icon";
import { formatEventDateShort } from "@/lib/format";

export type FilterOption = { value: string; label: string };

const SELECT_CLASS =
  "min-h-11 w-full rounded-2xl border border-line-strong bg-canvas px-3 text-sm font-normal text-ink";

type ScheduleFilterBarProps = {
  days: string[];
  missions: FilterOption[];
  positions: FilterOption[];
};

export function ScheduleFilterBar({ days, missions, positions }: ScheduleFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function update(key: string, value: string): void {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.replace(`/recapitulatif?${params.toString()}`);
  }

  const printHref = `/recapitulatif/impression?${searchParams.toString()}`;

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-line bg-surface p-5">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-subtle">Filtrer l'export</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft">
          Jour
          <select
            className={SELECT_CLASS}
            value={searchParams.get("day") ?? ""}
            onChange={(event) => update("day", event.target.value)}
          >
            <option value="">Tous les jours</option>
            {days.map((day) => (
              <option key={day} value={day}>
                {formatEventDateShort(day)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft">
          Mission
          <select
            className={SELECT_CLASS}
            value={searchParams.get("mission") ?? ""}
            onChange={(event) => update("mission", event.target.value)}
          >
            <option value="">Toutes les missions</option>
            {missions.map((mission) => (
              <option key={mission.value} value={mission.value}>
                {mission.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft">
          Créneau
          <select
            className={SELECT_CLASS}
            value={searchParams.get("position") ?? ""}
            onChange={(event) => update("position", event.target.value)}
          >
            <option value="">Tous les créneaux</option>
            {positions.map((position) => (
              <option key={position.value} value={position.value}>
                {position.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <a
        href={printHref}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-sunset inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold text-on-accent shadow-[0_10px_30px_var(--admin-glow)] transition hover:brightness-105"
      >
        <FluentIcon name="document-text" />
        Exporter / imprimer en PDF
      </a>
    </div>
  );
}
