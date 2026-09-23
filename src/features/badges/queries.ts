import "server-only";

import type { Prisma } from "@/generated/prisma/client";

import { db } from "@/lib/db";
import { buildVolunteerWhere } from "@/features/volunteers/admin-queries";
import type { BadgePrintParams, BadgeScope } from "@/features/badges/schemas";
import { MAX_EXPORT_ROWS } from "@/features/exports/table";

export type BadgeHolder = {
  id: string;
  badgeNumber: string;
  firstName: string;
  lastName: string;
  hasPhoto: boolean;
};

function buildScopeWhere(
  editionId: string,
  params: Omit<BadgePrintParams, "perimetre"> & { perimetre: BadgeScope },
  eventStartsAt: Date | null,
): Prisma.VolunteerWhereInput {
  if (params.benevole) return { editionId, id: params.benevole };
  if (params.perimetre === "validated") return { editionId, planningStatus: "LOCKED" };
  if (params.perimetre === "all") return { editionId };
  return buildVolunteerWhere(editionId, { ...params, page: 1 }, eventStartsAt);
}

/// Bénévoles d'un périmètre, triés par nom, photo présente ou non : la page de
/// préparation liste ceux qui bloquent l'impression.
export async function listBadgeHolders(
  editionId: string,
  params: BadgePrintParams,
  eventStartsAt: Date | null,
): Promise<BadgeHolder[]> {
  const records = await db.volunteer.findMany({
    where: buildScopeWhere(editionId, params, eventStartsAt),
    orderBy: [{ user: { lastName: "asc" } }, { user: { firstName: "asc" } }],
    take: MAX_EXPORT_ROWS,
    select: {
      id: true,
      badgeNumber: true,
      photoPath: true,
      user: { select: { firstName: true, lastName: true } },
    },
  });

  return records.map((record) => ({
    id: record.id,
    badgeNumber: record.badgeNumber,
    firstName: record.user.firstName,
    lastName: record.user.lastName,
    hasPhoto: record.photoPath !== null,
  }));
}

export type BadgeScopeCounts = Record<Exclude<BadgeScope, "selection">, number>;

export async function getBadgeScopeCounts(editionId: string): Promise<BadgeScopeCounts> {
  const [validated, all] = await Promise.all([
    db.volunteer.count({ where: { editionId, planningStatus: "LOCKED" } }),
    db.volunteer.count({ where: { editionId } }),
  ]);
  return { validated, all };
}

export type BadgeVerification = {
  id: string;
  badgeNumber: string;
  firstName: string;
  lastName: string;
  hasPhoto: boolean;
  planningStatus: "DRAFT" | "LOCKED";
  assignments: { id: string; missionName: string; location: string | null; startsAt: Date; endsAt: Date }[];
};

/// Ce que l'accueil voit au scan d'un badge. Limité à l'édition active : un
/// badge d'une édition passée n'est plus valable.
export async function getBadgeVerification(editionId: string, volunteerId: string): Promise<BadgeVerification | null> {
  const record = await db.volunteer.findFirst({
    where: { id: volunteerId, editionId },
    select: {
      id: true,
      badgeNumber: true,
      photoPath: true,
      planningStatus: true,
      user: { select: { firstName: true, lastName: true } },
      assignments: {
        orderBy: { missionSlot: { timeSlot: { startsAt: "asc" } } },
        select: {
          id: true,
          missionSlot: {
            select: {
              mission: { select: { name: true, location: true } },
              timeSlot: { select: { startsAt: true, endsAt: true } },
            },
          },
        },
      },
    },
  });
  if (!record) return null;

  return {
    id: record.id,
    badgeNumber: record.badgeNumber,
    firstName: record.user.firstName,
    lastName: record.user.lastName,
    hasPhoto: record.photoPath !== null,
    planningStatus: record.planningStatus,
    assignments: record.assignments.map((assignment) => ({
      id: assignment.id,
      missionName: assignment.missionSlot.mission.name,
      location: assignment.missionSlot.mission.location,
      startsAt: assignment.missionSlot.timeSlot.startsAt,
      endsAt: assignment.missionSlot.timeSlot.endsAt,
    })),
  };
}
