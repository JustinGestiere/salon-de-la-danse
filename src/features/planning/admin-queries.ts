import "server-only";

import { db } from "@/lib/db";
import { computeGaugeState, type GaugeState } from "@/features/planning/constants";
import { computeHeatLevel, type HeatLevel } from "@/features/planning/admin-grid";
import { groupTimeSlotsByDay, type PlanningDay } from "@/features/planning/queries";

export type AdminGridCell = {
  missionSlotId: string;
  missionId: string;
  timeSlotId: string;
  capacity: number;
  filled: number;
  isOpen: boolean;
  gauge: GaugeState;
  heat: HeatLevel;
};

export type AdminGridMission = {
  id: string;
  name: string;
  location: string | null;
  isSelfBookable: boolean;
};

export type AdminGrid = {
  days: PlanningDay[];
  missions: AdminGridMission[];
  /// Indexé par `${missionId}:${timeSlotId}`.
  cells: Record<string, AdminGridCell>;
};

export function adminCellKey(missionId: string, timeSlotId: string): string {
  return `${missionId}:${timeSlotId}`;
}

/// Grille complète vue par la régie : toutes les missions, postes sensibles
/// compris, avec le nombre d'inscrits de chaque case. Volume borné par la
/// grille (missions × créneaux), pas par le nombre de bénévoles.
export async function getAdminGrid(editionId: string): Promise<AdminGrid> {
  const [timeSlots, missions, missionSlots] = await Promise.all([
    db.timeSlot.findMany({
      where: { editionId },
      orderBy: [{ eventDate: "asc" }, { position: "asc" }],
      select: { id: true, eventDate: true, position: true, startsAt: true, endsAt: true },
    }),
    db.mission.findMany({
      where: { editionId },
      orderBy: { position: "asc" },
      select: { id: true, name: true, location: true, isSelfBookable: true },
    }),
    db.missionSlot.findMany({
      where: { mission: { editionId } },
      select: {
        id: true,
        missionId: true,
        timeSlotId: true,
        capacity: true,
        isOpen: true,
        _count: { select: { assignments: true } },
      },
    }),
  ]);

  const cells: Record<string, AdminGridCell> = {};
  for (const slot of missionSlots) {
    const filled = slot._count.assignments;
    cells[adminCellKey(slot.missionId, slot.timeSlotId)] = {
      missionSlotId: slot.id,
      missionId: slot.missionId,
      timeSlotId: slot.timeSlotId,
      capacity: slot.capacity,
      filled,
      isOpen: slot.isOpen,
      gauge: computeGaugeState(slot.capacity - filled, slot.capacity),
      heat: computeHeatLevel(filled, slot.capacity),
    };
  }

  return { days: groupTimeSlotsByDay(timeSlots), missions, cells };
}

export type MissionSlotOccupant = {
  assignmentId: string;
  volunteerId: string;
  firstName: string;
  lastName: string;
  phone: string;
  badgeNumber: string;
  planningStatus: "DRAFT" | "LOCKED";
  isAdminAssigned: boolean;
};

export type MissionSlotDetail = {
  id: string;
  capacity: number;
  isOpen: boolean;
  missionId: string;
  missionName: string;
  missionLocation: string | null;
  isSelfBookable: boolean;
  timeSlotId: string;
  eventDate: string;
  startsAt: Date;
  endsAt: Date;
  occupants: MissionSlotOccupant[];
};

/// Détail d'une case, noms des inscrits compris : réservé à la régie. Filtré par
/// édition, jamais par identifiant seul.
export async function getMissionSlotDetail(
  editionId: string,
  missionSlotId: string,
): Promise<MissionSlotDetail | null> {
  const slot = await db.missionSlot.findFirst({
    where: { id: missionSlotId, mission: { editionId } },
    select: {
      id: true,
      capacity: true,
      isOpen: true,
      mission: { select: { id: true, name: true, location: true, isSelfBookable: true } },
      timeSlot: { select: { id: true, eventDate: true, startsAt: true, endsAt: true } },
      assignments: {
        orderBy: { volunteer: { user: { lastName: "asc" } } },
        select: {
          id: true,
          source: true,
          volunteer: {
            select: {
              id: true,
              badgeNumber: true,
              planningStatus: true,
              user: { select: { firstName: true, lastName: true, phone: true } },
            },
          },
        },
      },
    },
  });
  if (!slot) return null;

  return {
    id: slot.id,
    capacity: slot.capacity,
    isOpen: slot.isOpen,
    missionId: slot.mission.id,
    missionName: slot.mission.name,
    missionLocation: slot.mission.location,
    isSelfBookable: slot.mission.isSelfBookable,
    timeSlotId: slot.timeSlot.id,
    eventDate: slot.timeSlot.eventDate.toISOString().slice(0, 10),
    startsAt: slot.timeSlot.startsAt,
    endsAt: slot.timeSlot.endsAt,
    occupants: slot.assignments.map((assignment) => ({
      assignmentId: assignment.id,
      volunteerId: assignment.volunteer.id,
      firstName: assignment.volunteer.user.firstName,
      lastName: assignment.volunteer.user.lastName,
      phone: assignment.volunteer.user.phone,
      badgeNumber: assignment.volunteer.badgeNumber,
      planningStatus: assignment.volunteer.planningStatus,
      isAdminAssigned: assignment.source === "ADMIN",
    })),
  };
}

export type AssignableVolunteer = {
  volunteerId: string;
  firstName: string;
  lastName: string;
  badgeNumber: string;
  assignmentCount: number;
};

/// Nombre de propositions affichées sous le champ de recherche d'une case.
export const ASSIGNABLE_SEARCH_LIMIT = 8;

/// Bénévoles de l'édition qu'on peut encore placer sur ce créneau : ceux qui
/// n'ont pas déjà une mission à la même heure.
export async function searchAssignableVolunteers(input: {
  editionId: string;
  timeSlotId: string;
  query: string;
}): Promise<AssignableVolunteer[]> {
  const volunteers = await db.volunteer.findMany({
    where: {
      editionId: input.editionId,
      assignments: { none: { timeSlotId: input.timeSlotId } },
      OR: [
        { badgeNumber: { contains: input.query, mode: "insensitive" } },
        { user: { firstName: { contains: input.query, mode: "insensitive" } } },
        { user: { lastName: { contains: input.query, mode: "insensitive" } } },
      ],
    },
    orderBy: [{ user: { lastName: "asc" } }, { user: { firstName: "asc" } }],
    take: ASSIGNABLE_SEARCH_LIMIT,
    select: {
      id: true,
      badgeNumber: true,
      user: { select: { firstName: true, lastName: true } },
      _count: { select: { assignments: true } },
    },
  });

  return volunteers.map((volunteer) => ({
    volunteerId: volunteer.id,
    firstName: volunteer.user.firstName,
    lastName: volunteer.user.lastName,
    badgeNumber: volunteer.badgeNumber,
    assignmentCount: volunteer._count.assignments,
  }));
}

export type SensitiveSlot = {
  missionSlotId: string;
  missionName: string;
  eventDate: string;
  startsAt: Date;
  endsAt: Date;
  filled: number;
  capacity: number;
};

/// Cases des postes sensibles (non réservables en libre-service), pour le
/// formulaire d'attribution depuis la fiche d'un bénévole.
export async function listSensitiveSlots(editionId: string): Promise<SensitiveSlot[]> {
  const slots = await db.missionSlot.findMany({
    where: { isOpen: true, mission: { editionId, isSelfBookable: false } },
    orderBy: [{ timeSlot: { startsAt: "asc" } }, { mission: { position: "asc" } }],
    select: {
      id: true,
      capacity: true,
      mission: { select: { name: true } },
      timeSlot: { select: { eventDate: true, startsAt: true, endsAt: true } },
      _count: { select: { assignments: true } },
    },
  });

  return slots.map((slot) => ({
    missionSlotId: slot.id,
    missionName: slot.mission.name,
    eventDate: slot.timeSlot.eventDate.toISOString().slice(0, 10),
    startsAt: slot.timeSlot.startsAt,
    endsAt: slot.timeSlot.endsAt,
    filled: slot._count.assignments,
    capacity: slot.capacity,
  }));
}

/// Jours et créneaux de l'édition, sans les cases : pour les vues qui n'ont
/// besoin que de l'axe du temps (fiche bénévole, filtres).
export async function getEditionTimeline(editionId: string): Promise<PlanningDay[]> {
  const timeSlots = await db.timeSlot.findMany({
    where: { editionId },
    orderBy: [{ eventDate: "asc" }, { position: "asc" }],
    select: { id: true, eventDate: true, position: true, startsAt: true, endsAt: true },
  });
  return groupTimeSlotsByDay(timeSlots);
}

export type MissionOption = {
  id: string;
  name: string;
  isSelfBookable: boolean;
};

export async function listMissionOptions(editionId: string): Promise<MissionOption[]> {
  return db.mission.findMany({
    where: { editionId },
    orderBy: { position: "asc" },
    select: { id: true, name: true, isSelfBookable: true },
  });
}
