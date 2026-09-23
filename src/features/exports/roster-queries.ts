import "server-only";

import { db } from "@/lib/db";
import type { PlanningExportParams } from "@/features/exports/schemas";

export type RosterVolunteer = {
  assignmentId: string;
  badgeNumber: string;
  fullName: string;
  phone: string;
  isAdminAssigned: boolean;
};

export type RosterSlot = {
  missionSlotId: string;
  startsAt: Date;
  endsAt: Date;
  capacity: number;
  volunteers: RosterVolunteer[];
};

export type MissionRoster = {
  missionId: string;
  name: string;
  location: string | null;
  isSelfBookable: boolean;
  slots: RosterSlot[];
};

/// Listes d'appel par mission : chaque créneau avec ses bénévoles, cases vides
/// comprises pour que le responsable voie les places à pourvoir.
export async function getMissionRosters(
  editionId: string,
  filter: Omit<PlanningExportParams, "format" | "edition">,
): Promise<MissionRoster[]> {
  const missionSlots = await db.missionSlot.findMany({
    where: {
      mission: { editionId, ...(filter.mission ? { id: filter.mission } : {}) },
      ...(filter.jour ? { timeSlot: { eventDate: new Date(`${filter.jour}T00:00:00Z`) } } : {}),
    },
    orderBy: [{ mission: { position: "asc" } }, { timeSlot: { startsAt: "asc" } }],
    select: {
      id: true,
      capacity: true,
      mission: { select: { id: true, name: true, location: true, isSelfBookable: true } },
      timeSlot: { select: { startsAt: true, endsAt: true } },
      assignments: {
        orderBy: { volunteer: { user: { lastName: "asc" } } },
        select: {
          id: true,
          source: true,
          volunteer: { select: { badgeNumber: true, user: { select: { firstName: true, lastName: true, phone: true } } } },
        },
      },
    },
  });

  const rosters = new Map<string, MissionRoster>();
  for (const slot of missionSlots) {
    const roster = rosters.get(slot.mission.id) ?? { missionId: slot.mission.id, ...slot.mission, slots: [] };
    roster.slots.push({
      missionSlotId: slot.id,
      startsAt: slot.timeSlot.startsAt,
      endsAt: slot.timeSlot.endsAt,
      capacity: slot.capacity,
      volunteers: slot.assignments.map((assignment) => ({
        assignmentId: assignment.id,
        badgeNumber: assignment.volunteer.badgeNumber,
        fullName: `${assignment.volunteer.user.lastName.toUpperCase()} ${assignment.volunteer.user.firstName}`,
        phone: assignment.volunteer.user.phone,
        isAdminAssigned: assignment.source === "ADMIN",
      })),
    });
    rosters.set(slot.mission.id, roster);
  }
  return [...rosters.values()];
}
