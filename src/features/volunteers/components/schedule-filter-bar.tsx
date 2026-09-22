"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { formatEventDateShort } from "@/lib/format";

export type FilterOption = { value: string; label: string };

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
    <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-sm font-semibold text-gray-800">Filtrer l'export</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
          Jour
          <select
            className="min-h-11 rounded-lg border border-gray-300 bg-white px-2 text-sm"
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

        <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
          Mission
          <select
            className="min-h-11 rounded-lg border border-gray-300 bg-white px-2 text-sm"
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

        <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
          Créneau
          <select
            className="min-h-11 rounded-lg border border-gray-300 bg-white px-2 text-sm"
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
        className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Exporter / imprimer en PDF
      </a>
    </div>
  );
}
