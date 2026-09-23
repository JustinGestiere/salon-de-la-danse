import "server-only";

import { toIsoDate } from "@/lib/dates";
import { db } from "@/lib/db";

export type AdminOverview = {
  volunteerCount: number;
  lockedPlanningCount: number;
  draftPlanningCount: number;
  invitationCount: number;
  invitationUsedCount: number;
  totalCapacity: number;
  filledSeats: number;
};

export type FillRate = {
  key: string;
  label: string;
  capacity: number;
  filled: number;
};

/// Compteurs temps réel du tableau de bord administrateur.
export async function getAdminOverview(editionId: string): Promise<AdminOverview> {
  const [
    volunteerCount,
    lockedPlanningCount,
    invitationCount,
    invitationUsedCount,
    capacity,
    filledSeats,
  ] = await Promise.all([
    db.volunteer.count({ where: { editionId } }),
    db.volunteer.count({ where: { editionId, planningStatus: "LOCKED" } }),
    db.invitationCode.count({ where: { editionId } }),
    db.invitationCode.count({ where: { editionId, usedAt: { not: null } } }),
    db.missionSlot.aggregate({
      where: { mission: { editionId } },
      _sum: { capacity: true },
    }),
    db.assignment.count({ where: { missionSlot: { mission: { editionId } } } }),
  ]);

  return {
    volunteerCount,
    lockedPlanningCount,
    draftPlanningCount: volunteerCount - lockedPlanningCount,
    invitationCount,
    invitationUsedCount,
    totalCapacity: capacity._sum.capacity ?? 0,
    filledSeats,
  };
}

/// Taux de remplissage par journée et par mission.
///
/// Une seule requête sur les cases de la grille, agrégée en mémoire : Prisma ne
/// sait pas grouper à travers une relation, et une requête par mission serait
/// un N+1. Le volume est borné par la grille elle-même (missions × créneaux,
/// une centaine de lignes), pas par le nombre de bénévoles : cette liste n'a
/// donc pas à être paginée.
export async function getFillRates(
  editionId: string,
): Promise<{ byDay: FillRate[]; byMission: FillRate[] }> {
  const slots = await db.missionSlot.findMany({
    where: { mission: { editionId } },
    select: {
      capacity: true,
      mission: { select: { id: true, name: true, position: true } },
      timeSlot: { select: { eventDate: true } },
      _count: { select: { assignments: true } },
    },
  });

  const days = new Map<string, FillRate>();
  const missions = new Map<string, FillRate & { position: number }>();

  for (const slot of slots) {
    const isoDate = toIsoDate(slot.timeSlot.eventDate);
    const day = days.get(isoDate) ?? { key: isoDate, label: isoDate, capacity: 0, filled: 0 };
    day.capacity += slot.capacity;
    day.filled += slot._count.assignments;
    days.set(isoDate, day);

    const mission = missions.get(slot.mission.id) ?? {
      key: slot.mission.id,
      label: slot.mission.name,
      capacity: 0,
      filled: 0,
      position: slot.mission.position,
    };
    mission.capacity += slot.capacity;
    mission.filled += slot._count.assignments;
    missions.set(slot.mission.id, mission);
  }

  return {
    byDay: [...days.values()].sort((left, right) => left.key.localeCompare(right.key)),
    byMission: [...missions.values()]
      .sort((left, right) => left.position - right.position)
      .map(({ key, label, capacity, filled }) => ({ key, label, capacity, filled })),
  };
}
