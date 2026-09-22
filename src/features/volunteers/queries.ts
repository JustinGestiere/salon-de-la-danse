import "server-only";

import { db } from "@/lib/db";

/// Nombre de créneaux réservés par un bénévole. Utilisé par le dashboard.
export async function countVolunteerAssignments(volunteerId: string): Promise<number> {
  return db.assignment.count({ where: { volunteerId } });
}

export type ScheduleEntry = {
  assignmentId: string;
  eventDate: string;
  timeSlotPosition: number;
  startsAt: Date;
  endsAt: Date;
  missionId: string;
  missionName: string;
  missionLocation: string | null;
  missionDescription: string | null;
  isAdminAssigned: boolean;
};

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/// Récapitulatif ordonné des missions d'un bénévole (jour puis créneau). Sert
/// au récapitulatif à l'écran comme à l'export imprimable.
export async function getVolunteerSchedule(
  volunteerId: string,
): Promise<ScheduleEntry[]> {
  const assignments = await db.assignment.findMany({
    where: { volunteerId },
    select: {
      id: true,
      source: true,
      missionSlot: {
        select: {
          mission: {
            select: { id: true, name: true, location: true, description: true },
          },
          timeSlot: {
            select: { eventDate: true, position: true, startsAt: true, endsAt: true },
          },
        },
      },
    },
  });

  return assignments
    .map((assignment) => ({
      assignmentId: assignment.id,
      eventDate: toIsoDate(assignment.missionSlot.timeSlot.eventDate),
      timeSlotPosition: assignment.missionSlot.timeSlot.position,
      startsAt: assignment.missionSlot.timeSlot.startsAt,
      endsAt: assignment.missionSlot.timeSlot.endsAt,
      missionId: assignment.missionSlot.mission.id,
      missionName: assignment.missionSlot.mission.name,
      missionLocation: assignment.missionSlot.mission.location,
      missionDescription: assignment.missionSlot.mission.description,
      isAdminAssigned: assignment.source === "ADMIN",
    }))
    .sort(
      (a, b) =>
        a.eventDate.localeCompare(b.eventDate) ||
        a.timeSlotPosition - b.timeSlotPosition,
    );
}
