import Link from "next/link";

import { formatEventDateShort, formatTimeRange } from "@/lib/format";
import type { HeatLevel } from "@/features/planning/admin-grid";
import { adminCellKey, type AdminGrid } from "@/features/planning/admin-queries";

const HEAT_CLASSES: Record<HeatLevel, string> = {
  low: "bg-ok-soft",
  free: "bg-ok",
  tight: "bg-warn",
  full: "bg-danger",
};

/// Ordre de la légende, du moins au plus rempli.
const HEAT_LEGEND_ORDER: readonly HeatLevel[] = ["low", "free", "tight", "full"];

const HEAT_LABELS: Record<HeatLevel, string> = {
  low: "Peu rempli",
  free: "Places disponibles",
  tight: "Presque complet",
  full: "Complet",
};

type WeekendHeatmapProps = {
  grid: AdminGrid;
  dayFillRates: Record<string, number>;
};

function describeSensitive(filled: number): { className: string; label: string } {
  return filled === 0
    ? { className: "border-[1.5px] border-dashed border-lilac", label: "Poste sensible à attribuer" }
    : { className: "bg-lilac", label: "Poste sensible attribué" };
}

/// Toute la grille du week-end en miniature : chaque case est un lien vers son
/// détail dans le planning.
export function WeekendHeatmap({ grid, dayFillRates }: WeekendHeatmapProps) {
  return (
    <section aria-labelledby="heatmap-title" className="flex flex-col gap-5 rounded-3xl border border-line bg-surface p-7">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="heatmap-title" className="font-display text-3xl text-ink">
          Le week-end <em className="text-muted">d'un coup d'œil</em>
        </h2>
        <Link href="/admin/planning" className="text-sm font-medium text-accent hover:underline">
          Ouvrir le planning →
        </Link>
      </div>

      <div className="flex overflow-x-auto pb-2">
        <div className="flex w-44 shrink-0 flex-col gap-[5px] pt-[50px]">
          {grid.missions.map((mission) => (
            <span
              key={mission.id}
              className={`flex h-[22px] items-center truncate text-[13px] ${mission.isSelfBookable ? "text-ink-soft" : "text-lilac-ink"}`}
            >
              {mission.name}
            </span>
          ))}
        </div>
        {grid.days.map((day) => (
          <div key={day.eventDate} className="flex flex-col gap-[5px] border-l border-line px-3.5">
            <div className="flex h-[45px] flex-col justify-end pb-1">
              <span className="font-display text-xl capitalize text-ink">{formatEventDateShort(day.eventDate)}</span>
              <span className="text-xs text-subtle">{dayFillRates[day.eventDate] ?? 0} % pourvu</span>
            </div>
            {grid.missions.map((mission) => (
              <div key={mission.id} className="flex gap-[5px]">
                {day.timeSlots.map((timeSlot) => {
                  const cell = grid.cells[adminCellKey(mission.id, timeSlot.id)];
                  if (!cell) return <span key={timeSlot.id} className="size-[22px]" />;
                  const look = mission.isSelfBookable
                    ? { className: HEAT_CLASSES[cell.heat], label: HEAT_LABELS[cell.heat] }
                    : describeSensitive(cell.filled);
                  const label = `${mission.name}, ${formatEventDateShort(day.eventDate)} ${formatTimeRange(timeSlot.startsAt, timeSlot.endsAt)} : ${cell.filled} sur ${cell.capacity}, ${look.label}`;
                  return (
                    <Link
                      key={timeSlot.id}
                      href={`/admin/planning?jour=${day.eventDate}&case=${cell.missionSlotId}`}
                      aria-label={label}
                      title={label}
                      className={`size-[22px] rounded-md transition hover:scale-110 ${cell.isOpen ? look.className : "bg-raised"}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        ))}
      </div>

      <ul className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted">
        {HEAT_LEGEND_ORDER.map((level) => (
          <li key={level} className="flex items-center gap-2">
            <span aria-hidden="true" className={`size-2.5 rounded-[3px] ${HEAT_CLASSES[level]}`} />
            {HEAT_LABELS[level]}
          </li>
        ))}
        <li className="flex items-center gap-2">
          <span aria-hidden="true" className="size-2.5 rounded-[3px] border-[1.5px] border-dashed border-lilac" />
          Poste sensible à attribuer
        </li>
      </ul>
    </section>
  );
}
