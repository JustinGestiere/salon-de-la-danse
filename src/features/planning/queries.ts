import "server-only";

import { db } from "@/lib/db";
import { computeGaugeState, type GaugeState } from "@/features/planning/constants";

export type PlanningCell = {
  missionSlotId: string;
  missionId: string;
  timeSlotId: string;
  capacity: number;
  remaining: number;
  gauge: GaugeState;
  isSelected: boolean;
};

export type PlanningTimeSlot = {
  id: string;
  position: number;
  startsAt: Date;
  endsAt: Date;
};

export type PlanningDay = {
  eventDate: string;
  timeSlots: PlanningTimeSlot[];
};

export type PlanningMission = {
  id: string;
  name: string;
  location: string | null;
  description: string | null;
  position: number;
};

export type PlanningView = {
  days: PlanningDay[];
  missions: PlanningMission[];
  /// Indexé par `${missionId}:${timeSlotId}`. Absent = mission non ouverte sur
  /// ce créneau.
  cells: Record<string, PlanningCell>;
  selectedMissionSlotIds: string[];
};

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function cellKey(missionId: string, timeSlotId: string): string {
  return `${missionId}:${timeSlotId}`;
}

/// Construit la vue complète de la grille pour un bénévole donné. N'expose que
/// des compteurs : jamais les noms des autres bénévoles.
export async function getPlanningView(
  editionId: string,
  volunteerId: string,
): Promise<PlanningView> {
  const [timeSlots, missions, missionSlots, myAssignments] = await Promise.all([
    db.timeSlot.findMany({
      where: { editionId },
      orderBy: [{ eventDate: "asc" }, { position: "asc" }],
      select: { id: true, eventDate: true, position: true, startsAt: true, endsAt: true },
    }),
    db.mission.findMany({
      where: { editionId, isSelfBookable: true },
      orderBy: { position: "asc" },
      select: { id: true, name: true, location: true, description: true, position: true },
    }),
    db.missionSlot.findMany({
      where: { isOpen: true, mission: { editionId, isSelfBookable: true } },
      select: {
        id: true,
        missionId: true,
        timeSlotId: true,
        capacity: true,
        _count: { select: { assignments: true } },
      },
    }),
    db.assignment.findMany({
      where: { volunteerId },
      select: { missionSlotId: true },
    }),
  ]);

  const selectedMissionSlotIds = myAssignments.map((a) => a.missionSlotId);
  const selectedSet = new Set(selectedMissionSlotIds);

  const cells: Record<string, PlanningCell> = {};
  for (const slot of missionSlots) {
    const remaining = Math.max(0, slot.capacity - slot._count.assignments);
    cells[cellKey(slot.missionId, slot.timeSlotId)] = {
      missionSlotId: slot.id,
      missionId: slot.missionId,
      timeSlotId: slot.timeSlotId,
      capacity: slot.capacity,
      remaining,
      gauge: computeGaugeState(remaining, slot.capacity),
      isSelected: selectedSet.has(slot.id),
    };
  }

  const days = groupTimeSlotsByDay(timeSlots);

  return {
    days,
    missions,
    cells,
    selectedMissionSlotIds,
  };
}

function groupTimeSlotsByDay(
  timeSlots: readonly {
    id: string;
    eventDate: Date;
    position: number;
    startsAt: Date;
    endsAt: Date;
  }[],
): PlanningDay[] {
  const byDate = new Map<string, PlanningTimeSlot[]>();
  for (const slot of timeSlots) {
    const key = toIsoDate(slot.eventDate);
    const list = byDate.get(key) ?? [];
    list.push({
      id: slot.id,
      position: slot.position,
      startsAt: slot.startsAt,
      endsAt: slot.endsAt,
    });
    byDate.set(key, list);
  }
  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([eventDate, slots]) => ({ eventDate, timeSlots: slots }));
}
