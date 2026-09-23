"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { AdminButton } from "@/components/admin/admin-button";
import { Stepper } from "@/components/admin/stepper";
import { applyMissionCapacityAction, setMissionAccessAction } from "@/features/editions/admin-actions";
import type { MissionSettingsRow as MissionRow } from "@/features/editions/admin-queries";
import { MAX_SLOT_CAPACITY } from "@/features/planning/admin-schemas";

const ACCESS_OPTIONS = [
  { isSelfBookable: true, label: "Libre" },
  { isSelfBookable: false, label: "Sur attribution" },
] as const;

function describeCapacity(mission: MissionRow): string {
  if (mission.slotCount === 0) return "Aucun créneau";
  if (mission.minCapacity === mission.maxCapacity) return `${mission.minCapacity} places par créneau`;
  return `De ${mission.minCapacity} à ${mission.maxCapacity} places selon le créneau`;
}

/// Une mission : accès libre ou réservé à l'admin (poste sensible), et jauge
/// appliquée d'un coup à tous ses créneaux.
export function MissionSettingsRow({ mission }: { mission: MissionRow }) {
  const router = useRouter();
  const [capacity, setCapacity] = useState(mission.maxCapacity);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const isCapacityUnchanged = capacity === mission.minCapacity && capacity === mission.maxCapacity;

  function run(action: () => ReturnType<typeof setMissionAccessAction>): void {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      router.refresh();
    });
  }

  return (
    <li className="grid items-center gap-4 border-b border-line py-4 md:grid-cols-[minmax(0,1fr)_230px_minmax(0,300px)]">
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className={`font-display text-xl ${mission.isSelfBookable ? "text-ink" : "text-lilac-ink"}`}>{mission.name}</span>
        <span className="text-xs text-subtle">
          {mission.location ? `${mission.location} · ` : ""}
          {describeCapacity(mission)}
        </span>
        {error ? (
          <span role="alert" className="text-xs text-danger-ink">
            {error}
          </span>
        ) : null}
      </div>
      <div role="group" aria-label={`Accès à la mission ${mission.name}`} className="flex w-fit rounded-full border border-line bg-canvas p-1">
        {ACCESS_OPTIONS.map((option) => {
          const isActive = option.isSelfBookable === mission.isSelfBookable;
          return (
            <button
              key={option.label}
              type="button"
              aria-pressed={isActive}
              disabled={isPending || isActive}
              onClick={() => run(() => setMissionAccessAction({ missionId: mission.id, isSelfBookable: option.isSelfBookable }))}
              className={`min-h-9 rounded-full px-3.5 text-xs font-medium transition ${
                isActive ? (option.isSelfBookable ? "bg-raised text-ink" : "bg-lilac-soft text-lilac-ink") : "text-muted hover:text-ink"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Stepper
          label={`Jauge de la mission ${mission.name}`}
          value={capacity}
          min={0}
          max={MAX_SLOT_CAPACITY}
          disabled={isPending || mission.slotCount === 0}
          onChange={setCapacity}
        />
        <AdminButton
          size="sm"
          disabled={mission.slotCount === 0 || isCapacityUnchanged}
          isLoading={isPending}
          onClick={() => run(() => applyMissionCapacityAction({ missionId: mission.id, capacity }))}
        >
          Appliquer
        </AdminButton>
      </div>
    </li>
  );
}
