import Link from "next/link";

import { formatTimeRange } from "@/lib/format";
import { buildQueryHref, type QueryParams } from "@/lib/url";
import type { HeatLevel } from "@/features/planning/admin-grid";
import { adminCellKey, type AdminGrid, type AdminGridCell } from "@/features/planning/admin-queries";
import type { PlanningDay } from "@/features/planning/queries";

/// Au-delà, les pastilles de places ne tiennent plus dans une case.
const MAX_SEAT_DOTS = 8;
const MINUTES_PER_MS = 60_000;

const HEAT_CLASSES: Record<HeatLevel, string> = {
  low: "border-ok/40 bg-ok-soft text-ok-ink",
  free: "border-ok/50 bg-ok-soft text-ok-ink",
  tight: "border-warn/60 bg-warn-soft text-warn-ink",
  full: "border-danger/60 bg-danger-soft text-danger-ink",
};

type AdminPlanningGridProps = {
  grid: AdminGrid;
  day: PlanningDay;
  selectedSlotId: string | null;
  params: QueryParams;
};

function durationMinutes(startsAt: Date, endsAt: Date): number {
  return Math.round((endsAt.getTime() - startsAt.getTime()) / MINUTES_PER_MS);
}

function describeCell(cell: AdminGridCell, isSensitive: boolean): { text: string; className: string } {
  if (!cell.isOpen) return { text: "Fermée", className: "border-line bg-canvas text-subtle" };
  if (isSensitive) {
    return cell.filled === 0
      ? { text: "À attribuer", className: "border-dashed border-lilac bg-lilac-soft/40 text-lilac-ink" }
      : { text: `${cell.filled} attribué${cell.filled > 1 ? "s" : ""}`, className: "border-lilac/50 bg-lilac-soft text-lilac-ink" };
  }
  if (cell.heat === "full") return { text: "Complet", className: HEAT_CLASSES.full };
  const left = cell.capacity - cell.filled;
  return { text: `${left} place${left > 1 ? "s" : ""}`, className: HEAT_CLASSES[cell.heat] };
}

/// Conducteur de la journée : une ligne par mission, les créneaux à l'échelle
/// de leur durée (le premier, plus court, se voit plus court).
export function AdminPlanningGrid({ grid, day, selectedSlotId, params }: AdminPlanningGridProps) {
  return (
    <div className="flex flex-col gap-1.5 overflow-x-auto">
      <div className="flex min-w-[760px] gap-3">
        <div className="w-48 shrink-0" />
        <div className="flex flex-1 gap-1.5">
          {day.timeSlots.map((timeSlot) => (
            <span
              key={timeSlot.id}
              style={{ flexGrow: durationMinutes(timeSlot.startsAt, timeSlot.endsAt) }}
              className="basis-0 border-l border-line-strong pb-1 pl-2 font-code text-[11px] text-subtle"
            >
              {formatTimeRange(timeSlot.startsAt, timeSlot.endsAt)}
            </span>
          ))}
        </div>
      </div>

      {grid.missions.map((mission) => (
        <div key={mission.id} className="flex min-w-[760px] items-stretch gap-3">
          <div className="flex w-48 shrink-0 flex-col justify-center">
            <span className={`text-sm font-medium ${mission.isSelfBookable ? "text-ink" : "text-lilac-ink"}`}>{mission.name}</span>
            <span className="text-[11px] text-subtle">{mission.isSelfBookable ? mission.location ?? "" : "Hors planning public"}</span>
          </div>
          <div className="flex flex-1 gap-1.5">
            {day.timeSlots.map((timeSlot) => {
              const cell = grid.cells[adminCellKey(mission.id, timeSlot.id)];
              const grow = durationMinutes(timeSlot.startsAt, timeSlot.endsAt);
              if (!cell) {
                return <span key={timeSlot.id} style={{ flexGrow: grow }} className="h-[46px] basis-0" />;
              }
              const look = describeCell(cell, !mission.isSelfBookable);
              const isSelected = cell.missionSlotId === selectedSlotId;
              return (
                <Link
                  key={timeSlot.id}
                  href={buildQueryHref("/admin/planning", params, { jour: day.eventDate, case: cell.missionSlotId, recherche: undefined })}
                  scroll={false}
                  aria-current={isSelected ? "true" : undefined}
                  aria-label={`${mission.name}, ${formatTimeRange(timeSlot.startsAt, timeSlot.endsAt)} : ${cell.filled} sur ${cell.capacity}, ${look.text}`}
                  style={{ flexGrow: grow }}
                  className={`flex h-[46px] min-w-0 basis-0 flex-col justify-between rounded-xl border px-2.5 py-1.5 transition hover:brightness-110 ${look.className} ${
                    isSelected ? "outline-[1.5px] outline-offset-2 outline-accent-strong shadow-[0_0_0_4px_var(--admin-glow)]" : ""
                  }`}
                >
                  <span aria-hidden="true" className="flex gap-[3px]">
                    {Array.from({ length: Math.min(cell.capacity, MAX_SEAT_DOTS) }, (_, index) => (
                      <span
                        key={index}
                        className={`size-1.5 rounded-full border border-current ${index < cell.filled ? "bg-current" : ""}`}
                      />
                    ))}
                  </span>
                  <span className="truncate text-xs font-medium">{look.text}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
