import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { toIsoDate } from "@/lib/dates";
import { db } from "@/lib/db";
import type { ReminderCampaign } from "@/features/notifications/constants";
import type { EmailScheduleEntry } from "@/features/notifications/volunteer-emails";

export type VolunteerContact = {
  email: string;
  firstName: string;
  editionId: string;
  editionName: string;
  minSlots: number;
  maxSlots: number;
};

/// Coordonnées nécessaires à un e-mail adressé à un bénévole.
export async function getVolunteerContact(volunteerId: string): Promise<VolunteerContact | null> {
  const volunteer = await db.volunteer.findUnique({
    where: { id: volunteerId },
    select: {
      editionId: true,
      user: { select: { email: true, firstName: true } },
      edition: { select: { name: true, minSlotsPerVolunteer: true, maxSlotsPerVolunteer: true } },
    },
  });
  if (!volunteer) return null;

  return {
    email: volunteer.user.email,
    firstName: volunteer.user.firstName,
    editionId: volunteer.editionId,
    editionName: volunteer.edition.name,
    minSlots: volunteer.edition.minSlotsPerVolunteer,
    maxSlots: volunteer.edition.maxSlotsPerVolunteer,
  };
}

/// Bénévoles visés par chaque relance.
const CAMPAIGN_FILTERS: Record<ReminderCampaign, Prisma.VolunteerWhereInput> = {
  draftPlanning: { planningStatus: "DRAFT" },
  missingPhoto: { photoPath: null },
  eventReminder: { planningStatus: "LOCKED" },
};

export type CampaignRecipient = {
  volunteerId: string;
  email: string;
  firstName: string;
};

export async function listCampaignRecipients(
  editionId: string,
  campaign: ReminderCampaign,
): Promise<CampaignRecipient[]> {
  const volunteers = await db.volunteer.findMany({
    where: { editionId, ...CAMPAIGN_FILTERS[campaign] },
    orderBy: { createdAt: "asc" },
    select: { id: true, user: { select: { email: true, firstName: true } } },
  });
  return volunteers.map((volunteer) => ({
    volunteerId: volunteer.id,
    email: volunteer.user.email,
    firstName: volunteer.user.firstName,
  }));
}

export async function countCampaignRecipients(editionId: string): Promise<Record<ReminderCampaign, number>> {
  const [draftPlanning, missingPhoto, eventReminder] = await Promise.all([
    db.volunteer.count({ where: { editionId, ...CAMPAIGN_FILTERS.draftPlanning } }),
    db.volunteer.count({ where: { editionId, ...CAMPAIGN_FILTERS.missingPhoto } }),
    db.volunteer.count({ where: { editionId, ...CAMPAIGN_FILTERS.eventReminder } }),
  ]);
  return { draftPlanning, missingPhoto, eventReminder };
}

/// Plannings de tous les bénévoles validés, en une requête (pas une par
/// bénévole), rangés par bénévole et par ordre chronologique.
export async function listLockedSchedules(editionId: string): Promise<Map<string, EmailScheduleEntry[]>> {
  const assignments = await db.assignment.findMany({
    where: { volunteer: { editionId, ...CAMPAIGN_FILTERS.eventReminder } },
    orderBy: { missionSlot: { timeSlot: { startsAt: "asc" } } },
    select: {
      volunteerId: true,
      missionSlot: {
        select: {
          timeSlot: { select: { eventDate: true, startsAt: true, endsAt: true } },
          mission: { select: { name: true, location: true } },
        },
      },
    },
  });

  const schedules = new Map<string, EmailScheduleEntry[]>();
  for (const assignment of assignments) {
    const { timeSlot, mission } = assignment.missionSlot;
    const entries = schedules.get(assignment.volunteerId) ?? [];
    schedules.set(assignment.volunteerId, [
      ...entries,
      {
        eventDate: toIsoDate(timeSlot.eventDate),
        startsAt: timeSlot.startsAt,
        endsAt: timeSlot.endsAt,
        missionName: mission.name,
        missionLocation: mission.location,
      },
    ]);
  }
  return schedules;
}
