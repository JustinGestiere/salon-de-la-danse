"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { formatEventDateLong, formatTimeRange } from "@/lib/format";
import { toggleAssignmentAction, lockPlanningAction } from "@/features/planning/actions";
import {
  canAddCell,
  validateSelection,
  type SelectedCell,
  type SlotRules,
} from "@/features/planning/rules";
import type { GaugeState } from "@/features/planning/constants";

export type BoardCell = {
  missionSlotId: string;
  missionId: string;
  timeSlotId: string;
  capacity: number;
  remaining: number;
  gauge: GaugeState;
};

export type BoardTimeSlot = {
  id: string;
  position: number;
  startsAtIso: string;
  endsAtIso: string;
};

export type BoardDay = {
  eventDate: string;
  timeSlots: BoardTimeSlot[];
};

export type BoardMission = {
  id: string;
  name: string;
  location: string | null;
};

export type PlanningBoardProps = {
  days: BoardDay[];
  missions: BoardMission[];
  cells: BoardCell[];
  initialSelected: string[];
  rules: SlotRules;
  editable: boolean;
};

const GAUGE_STYLES: Record<GaugeState, string> = {
  free: "border-gauge-free/40 bg-green-50 text-green-800",
  tight: "border-gauge-tight/40 bg-orange-50 text-orange-800",
  full: "border-gray-300 bg-gray-100 text-gray-500",
};

export function PlanningBoard({
  days,
  missions,
  cells,
  initialSelected,
  rules,
  editable,
}: PlanningBoardProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set(initialSelected));
  const [pending, startTransition] = useTransition();
  const [notice, setNotice] = useState<string | null>(null);

  const cellById = useMemo(() => indexCells(cells), [cells]);
  const cellMetaBySlot = useMemo(() => buildCellMeta(days, cells), [days, cells]);
  const missionById = useMemo(() => indexMissions(missions), [missions]);

  const selectedCells = useMemo(
    () => buildSelectedCells(selected, cellMetaBySlot),
    [selected, cellMetaBySlot],
  );
  const violations = useMemo(
    () => validateSelection(selectedCells, rules),
    [selectedCells, rules],
  );

  function handleToggle(cell: BoardCell): void {
    setNotice(null);
    const isSelected = selected.has(cell.missionSlotId);

    if (!isSelected) {
      const meta = cellMetaBySlot.get(cell.missionSlotId);
      if (meta) {
        const violation = canAddCell(selectedCells, meta, rules);
        if (violation) {
          setNotice(violation.message);
          return;
        }
      }
      if (cell.remaining <= 0) {
        setNotice("Cette mission est complète.");
        return;
      }
    }

    startTransition(async () => {
      const result = await toggleAssignmentAction(cell.missionSlotId);
      if (!result.ok) {
        setNotice(result.error.message);
        router.refresh();
        return;
      }
      setSelected((previous) => nextSelection(previous, cell.missionSlotId, result.data.selected));
      router.refresh();
    });
  }

  function handleLock(): void {
    if (!window.confirm(
      "Valider définitivement votre planning ? Vous ne pourrez plus le modifier vous-même.",
    )) {
      return;
    }
    setNotice(null);
    startTransition(async () => {
      const result = await lockPlanningAction();
      if (!result.ok) {
        setNotice(result.error.message);
        return;
      }
      router.push("/recapitulatif");
      router.refresh();
    });
  }

  const canLock = editable && selectedCells.length > 0 && violations.length === 0;

  return (
    <div className="flex flex-col gap-6">
      {notice ? <Alert tone="warning">{notice}</Alert> : null}

      {days.map((day) => (
        <section key={day.eventDate} className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold capitalize text-gray-900">
            {formatEventDateLong(day.eventDate)}
          </h2>
          {day.timeSlots.map((timeSlot) => (
            <div key={timeSlot.id} className="rounded-xl border border-gray-200 bg-white p-3">
              <p className="mb-2 text-sm font-semibold text-brand-700">
                {formatTimeRange(new Date(timeSlot.startsAtIso), new Date(timeSlot.endsAtIso))}
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {missions.map((mission) => {
                  const cell = cellById.get(cellKey(mission.id, timeSlot.id));
                  if (!cell) return null;
                  return (
                    <SlotButton
                      key={cell.missionSlotId}
                      cell={cell}
                      missionName={missionById.get(mission.id)?.name ?? ""}
                      missionLocation={missionById.get(mission.id)?.location ?? null}
                      isSelected={selected.has(cell.missionSlotId)}
                      disabled={!editable || pending}
                      onToggle={handleToggle}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      ))}

      <div className="sticky bottom-0 flex flex-col gap-2 border-t border-gray-200 bg-white/95 py-3 backdrop-blur">
        <p className="text-sm text-gray-600">
          {selectedCells.length} créneau{selectedCells.length > 1 ? "x" : ""} sélectionné
          {selectedCells.length > 1 ? "s" : ""} (max {rules.maxSlots}).
        </p>
        {violations.length > 0 ? (
          <ul className="text-sm text-orange-700">
            {violations.map((violation) => (
              <li key={violation.code}>• {violation.message}</li>
            ))}
          </ul>
        ) : null}
        {editable ? (
          <Button onClick={handleLock} disabled={!canLock} isLoading={pending}>
            Valider définitivement mon planning
          </Button>
        ) : (
          <Alert tone="info">Votre planning n'est pas modifiable pour le moment.</Alert>
        )}
      </div>
    </div>
  );
}

function SlotButton({
  cell,
  missionName,
  missionLocation,
  isSelected,
  disabled,
  onToggle,
}: {
  cell: BoardCell;
  missionName: string;
  missionLocation: string | null;
  isSelected: boolean;
  disabled: boolean;
  onToggle: (cell: BoardCell) => void;
}) {
  const isFull = cell.remaining <= 0 && !isSelected;
  return (
    <button
      type="button"
      onClick={() => onToggle(cell)}
      disabled={disabled || isFull}
      aria-pressed={isSelected}
      className={`flex min-h-16 flex-col items-start rounded-lg border p-2 text-left text-sm transition-colors disabled:cursor-not-allowed ${
        isSelected
          ? "border-brand-600 bg-brand-600 text-white"
          : GAUGE_STYLES[cell.gauge]
      }`}
    >
      <span className="font-semibold">{missionName}</span>
      {missionLocation ? (
        <span className={isSelected ? "text-brand-100" : "text-current/70"}>{missionLocation}</span>
      ) : null}
      <span className="mt-1 text-xs">
        {isSelected
          ? "✓ Sélectionné"
          : isFull
            ? "Complet"
            : `${cell.remaining} place${cell.remaining > 1 ? "s" : ""}`}
      </span>
    </button>
  );
}

function cellKey(missionId: string, timeSlotId: string): string {
  return `${missionId}:${timeSlotId}`;
}

function indexCells(cells: readonly BoardCell[]): Map<string, BoardCell> {
  const map = new Map<string, BoardCell>();
  for (const cell of cells) {
    map.set(cellKey(cell.missionId, cell.timeSlotId), cell);
  }
  return map;
}

function indexMissions(missions: readonly BoardMission[]): Map<string, BoardMission> {
  return new Map(missions.map((mission) => [mission.id, mission]));
}

function buildCellMeta(
  days: readonly BoardDay[],
  cells: readonly BoardCell[],
): Map<string, SelectedCell> {
  const slotMeta = new Map<string, { eventDate: string; position: number }>();
  for (const day of days) {
    for (const timeSlot of day.timeSlots) {
      slotMeta.set(timeSlot.id, { eventDate: day.eventDate, position: timeSlot.position });
    }
  }

  const map = new Map<string, SelectedCell>();
  for (const cell of cells) {
    const meta = slotMeta.get(cell.timeSlotId);
    if (!meta) continue;
    map.set(cell.missionSlotId, {
      missionSlotId: cell.missionSlotId,
      timeSlotId: cell.timeSlotId,
      eventDate: meta.eventDate,
      position: meta.position,
    });
  }
  return map;
}

function buildSelectedCells(
  selected: ReadonlySet<string>,
  metaBySlot: ReadonlyMap<string, SelectedCell>,
): SelectedCell[] {
  const result: SelectedCell[] = [];
  for (const missionSlotId of selected) {
    const meta = metaBySlot.get(missionSlotId);
    if (meta) result.push(meta);
  }
  return result;
}

function nextSelection(
  previous: ReadonlySet<string>,
  missionSlotId: string,
  isSelected: boolean,
): Set<string> {
  const next = new Set(previous);
  if (isSelected) next.add(missionSlotId);
  else next.delete(missionSlotId);
  return next;
}
