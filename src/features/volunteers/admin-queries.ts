import "server-only";

import type { Prisma } from "@/generated/prisma/client";

import { db } from "@/lib/db";
import type { VolunteerListFilterInput } from "@/features/volunteers/admin-schemas";
import { computeMinorBirthDateCutoff, isMinorOn } from "@/features/volunteers/status";

export const VOLUNTEERS_PER_PAGE = 20;

export type VolunteerListRow = {
  id: string;
  badgeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  planningStatus: "DRAFT" | "LOCKED";
  assignmentCount: number;
  missionNames: string[];
  hasPhoto: boolean;
  isMinorPending: boolean;
};

export type VolunteerListPage = {
  rows: VolunteerListRow[];
  total: number;
  page: number;
  pageCount: number;
};

function buildStatusWhere(
  statut: VolunteerListFilterInput["statut"],
  eventStartsAt: Date | null,
): Prisma.VolunteerWhereInput {
  if (statut === "locked") return { planningStatus: "LOCKED" };
  if (statut === "draft") return { planningStatus: "DRAFT", assignments: { some: {} } };
  if (statut === "empty") return { planningStatus: "DRAFT", assignments: { none: {} } };
  if (statut === "minor") {
    if (!eventStartsAt) return { id: { in: [] } };
    return {
      minorApprovedAt: null,
      user: { birthDate: { gt: computeMinorBirthDateCutoff(eventStartsAt) } },
    };
  }
  return {};
}

/// Mission et jour visent la même affectation : « Accueil le samedi », pas
/// « Accueil un jour et n'importe quoi le samedi ».
function buildAssignmentWhere(filter: VolunteerListFilterInput): Prisma.VolunteerWhereInput {
  if (!filter.mission && !filter.jour) return {};
  return {
    assignments: {
      some: {
        missionSlot: {
          ...(filter.mission ? { missionId: filter.mission } : {}),
          ...(filter.jour ? { timeSlot: { eventDate: new Date(`${filter.jour}T00:00:00Z`) } } : {}),
        },
      },
    },
  };
}

function buildSearchWhere(query: string | undefined): Prisma.VolunteerWhereInput {
  if (!query) return {};
  return {
    OR: [
      { badgeNumber: { contains: query, mode: "insensitive" } },
      { user: { firstName: { contains: query, mode: "insensitive" } } },
      { user: { lastName: { contains: query, mode: "insensitive" } } },
      { user: { email: { contains: query, mode: "insensitive" } } },
    ],
  };
}

export function buildVolunteerWhere(
  editionId: string,
  filter: VolunteerListFilterInput,
  eventStartsAt: Date | null,
): Prisma.VolunteerWhereInput {
  return {
    AND: [
      { editionId },
      buildStatusWhere(filter.statut, eventStartsAt),
      buildAssignmentWhere(filter),
      buildSearchWhere(filter.q),
    ],
  };
}

/// Liste paginée des bénévoles d'une édition. Les missions viennent dans la
/// même requête (select imbriqué) : pas de requête par ligne.
export async function listVolunteers(
  editionId: string,
  filter: VolunteerListFilterInput,
  eventStartsAt: Date | null,
): Promise<VolunteerListPage> {
  const where = buildVolunteerWhere(editionId, filter, eventStartsAt);
  const [total, records] = await Promise.all([
    db.volunteer.count({ where }),
    db.volunteer.findMany({
      where,
      orderBy: [{ user: { lastName: "asc" } }, { user: { firstName: "asc" } }],
      skip: (filter.page - 1) * VOLUNTEERS_PER_PAGE,
      take: VOLUNTEERS_PER_PAGE,
      select: {
        id: true,
        badgeNumber: true,
        planningStatus: true,
        photoPath: true,
        minorApprovedAt: true,
        user: { select: { firstName: true, lastName: true, email: true, phone: true, birthDate: true } },
        assignments: { select: { missionSlot: { select: { mission: { select: { name: true } } } } } },
      },
    }),
  ]);

  const rows = records.map((record) => ({
    id: record.id,
    badgeNumber: record.badgeNumber,
    firstName: record.user.firstName,
    lastName: record.user.lastName,
    email: record.user.email,
    phone: record.user.phone,
    planningStatus: record.planningStatus,
    assignmentCount: record.assignments.length,
    missionNames: [...new Set(record.assignments.map((assignment) => assignment.missionSlot.mission.name))],
    hasPhoto: record.photoPath !== null,
    isMinorPending:
      record.minorApprovedAt === null &&
      record.user.birthDate !== null &&
      eventStartsAt !== null &&
      isMinorOn(record.user.birthDate, eventStartsAt),
  }));

  return {
    rows,
    total,
    page: filter.page,
    pageCount: Math.max(1, Math.ceil(total / VOLUNTEERS_PER_PAGE)),
  };
}

export type VolunteerStatusCounts = {
  all: number;
  locked: number;
  draft: number;
  empty: number;
  minor: number;
};

export async function getVolunteerStatusCounts(
  editionId: string,
  eventStartsAt: Date | null,
): Promise<VolunteerStatusCounts> {
  const count = (statut: VolunteerListFilterInput["statut"]): Promise<number> =>
    db.volunteer.count({ where: { editionId, ...buildStatusWhere(statut, eventStartsAt) } });

  const [all, locked, draft, empty, minor] = await Promise.all([
    count(undefined),
    count("locked"),
    count("draft"),
    count("empty"),
    count("minor"),
  ]);
  return { all, locked, draft, empty, minor };
}

export type VolunteerAssignment = {
  assignmentId: string;
  missionSlotId: string;
  missionName: string;
  missionLocation: string | null;
  isSensitive: boolean;
  isAdminAssigned: boolean;
  timeSlotId: string;
  eventDate: string;
  position: number;
  startsAt: Date;
  endsAt: Date;
};

export type VolunteerDetail = {
  id: string;
  userId: string;
  badgeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: Date | null;
  hasPhoto: boolean;
  planningStatus: "DRAFT" | "LOCKED";
  lockedAt: Date | null;
  minorApprovedAt: Date | null;
  invitationCode: string | null;
  createdAt: Date;
  assignments: VolunteerAssignment[];
};

/// Fiche complète d'un bénévole. Filtrée par édition : un identifiant seul ne
/// suffit pas à ouvrir une fiche.
export async function getVolunteerDetail(
  editionId: string,
  volunteerId: string,
): Promise<VolunteerDetail | null> {
  const record = await db.volunteer.findFirst({
    where: { id: volunteerId, editionId },
    select: {
      id: true,
      badgeNumber: true,
      photoPath: true,
      planningStatus: true,
      lockedAt: true,
      minorApprovedAt: true,
      createdAt: true,
      invitationCode: { select: { code: true } },
      user: {
        select: { id: true, firstName: true, lastName: true, email: true, phone: true, birthDate: true },
      },
      assignments: {
        select: {
          id: true,
          source: true,
          missionSlot: {
            select: {
              id: true,
              mission: { select: { name: true, location: true, isSelfBookable: true } },
              timeSlot: { select: { id: true, eventDate: true, position: true, startsAt: true, endsAt: true } },
            },
          },
        },
      },
    },
  });
  if (!record) return null;

  const assignments = record.assignments
    .map((assignment) => ({
      assignmentId: assignment.id,
      missionSlotId: assignment.missionSlot.id,
      missionName: assignment.missionSlot.mission.name,
      missionLocation: assignment.missionSlot.mission.location,
      isSensitive: !assignment.missionSlot.mission.isSelfBookable,
      isAdminAssigned: assignment.source === "ADMIN",
      timeSlotId: assignment.missionSlot.timeSlot.id,
      eventDate: assignment.missionSlot.timeSlot.eventDate.toISOString().slice(0, 10),
      position: assignment.missionSlot.timeSlot.position,
      startsAt: assignment.missionSlot.timeSlot.startsAt,
      endsAt: assignment.missionSlot.timeSlot.endsAt,
    }))
    .sort((left, right) => left.startsAt.getTime() - right.startsAt.getTime());

  return {
    id: record.id,
    userId: record.user.id,
    badgeNumber: record.badgeNumber,
    firstName: record.user.firstName,
    lastName: record.user.lastName,
    email: record.user.email,
    phone: record.user.phone,
    birthDate: record.user.birthDate,
    hasPhoto: record.photoPath !== null,
    planningStatus: record.planningStatus,
    lockedAt: record.lockedAt,
    minorApprovedAt: record.minorApprovedAt,
    invitationCode: record.invitationCode?.code ?? null,
    createdAt: record.createdAt,
    assignments,
  };
}

/// Chemin de la photo d'un bénévole de l'édition, pour la route qui la sert.
export async function getVolunteerPhotoPath(
  editionId: string,
  volunteerId: string,
): Promise<string | null> {
  const record = await db.volunteer.findFirst({
    where: { id: volunteerId, editionId },
    select: { photoPath: true },
  });
  return record?.photoPath ?? null;
}
