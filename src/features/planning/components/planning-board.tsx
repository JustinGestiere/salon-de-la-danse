"use client";

import { useState, useTransition } from "react";
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
import { SlotButton } from "@/features/planning/components/slot-button";

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
  isEditable: boolean;
};

export function PlanningBoard({
  days,
  missions,
  cells,
  initialSelected,
  rules,
  isEditable,
}: PlanningBoardProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set(initialSelected));
  const [isPending, startTransition] = useTransition();
  const [notice, setNotice] = useState<string | null>(null);

  // Calculés à chaque rendu, sans useMemo : la grille compte une centaine de
  // cases au plus, aucun problème de performance n'a été constaté.
  const cellById = indexCells(cells);
  const cellMetaBySlot = buildCellMeta(days, cells);
  const missionById = indexMissions(missions);
  const selectedCells = buildSelectedCells(selected, cellMetaBySlot);
  const violations = validateSelection(selectedCells, rules);

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

  const canLock = isEditable && selectedCells.length > 0 && violations.length === 0;

  return (
    <div className="flex flex-col gap-6">
      {notice ? <Alert tone="warning">{notice}</Alert> : null}

      {days.map((day) => (
        <section key={day.eventDate} className="flex flex-col gap-3">
          <h2 className="font-display text-3xl capitalize leading-none text-ink">
            {formatEventDateLong(day.eventDate)}
          </h2>
          {day.timeSlots.map((timeSlot) => (
            <div key={timeSlot.id} className="rounded-3xl border border-line bg-surface p-4">
              <p className="mb-3 font-code text-sm text-accent">
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
                      isDisabled={!isEditable || isPending}
                      onToggle={handleToggle}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      ))}

      <div className="sticky bottom-0 -mx-4 flex flex-col gap-3 border-t border-line bg-canvas/95 px-4 py-4 backdrop-blur">
        <p className="text-sm text-muted">
          {selectedCells.length} créneau{selectedCells.length > 1 ? "x" : ""} sélectionné
          {selectedCells.length > 1 ? "s" : ""} (max {rules.maxSlots}).
        </p>
        {violations.length > 0 ? (
          <ul className="text-sm text-warn-ink">
            {violations.map((violation) => (
              <li key={violation.code}>• {violation.message}</li>
            ))}
          </ul>
        ) : null}
        {isEditable ? (
          <Button onClick={handleLock} disabled={!canLock} isLoading={isPending}>
            Valider définitivement mon planning
          </Button>
        ) : (
          <Alert tone="info">Votre planning n'est pas modifiable pour le moment.</Alert>
        )}
      </div>
    </div>
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
