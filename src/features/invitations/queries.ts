import "server-only";

import type { Prisma } from "@/generated/prisma/client";

import { db } from "@/lib/db";
import {
  INVITATIONS_PER_PAGE,
  type InvitationStatus,
} from "@/features/invitations/constants";
import type { InvitationFilter } from "@/features/invitations/schemas";

export type InvitationRow = {
  id: string;
  code: string;
  email: string | null;
  status: InvitationStatus;
  createdAt: Date;
  expiresAt: Date | null;
  usedAt: Date | null;
  volunteerName: string | null;
  badgeNumber: string | null;
};

export type InvitationPage = {
  rows: InvitationRow[];
  total: number;
  page: number;
  pageCount: number;
};

export type InvitationCounts = {
  total: number;
  available: number;
  used: number;
  expired: number;
};

function buildStatusFilter(
  status: InvitationStatus | undefined,
  now: Date,
): Prisma.InvitationCodeWhereInput {
  if (status === "used") return { usedAt: { not: null } };
  if (status === "expired") return { usedAt: null, expiresAt: { lte: now } };
  if (status === "available") {
    return { usedAt: null, OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] };
  }
  return {};
}

function buildWhere(
  editionId: string,
  filter: InvitationFilter,
  now: Date,
): Prisma.InvitationCodeWhereInput {
  const search = filter.q;
  return {
    editionId,
    ...buildStatusFilter(filter.status, now),
    ...(search
      ? {
          OR: [
            { code: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
}

function resolveStatus(
  row: { usedAt: Date | null; expiresAt: Date | null },
  now: Date,
): InvitationStatus {
  if (row.usedAt !== null) return "used";
  if (row.expiresAt !== null && row.expiresAt <= now) return "expired";
  return "available";
}

/// Liste paginée des codes d'une édition. La pagination est imposée : le salon
/// prévoit 130 bénévoles, donc autant de codes, et la liste grandit à chaque
/// vague d'envoi.
export async function listInvitations(
  editionId: string,
  filter: InvitationFilter,
): Promise<InvitationPage> {
  const now = new Date();
  const where = buildWhere(editionId, filter, now);

  const [total, records] = await Promise.all([
    db.invitationCode.count({ where }),
    db.invitationCode.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { code: "asc" }],
      skip: (filter.page - 1) * INVITATIONS_PER_PAGE,
      take: INVITATIONS_PER_PAGE,
      select: {
        id: true,
        code: true,
        email: true,
        createdAt: true,
        expiresAt: true,
        usedAt: true,
        usedByVolunteer: {
          select: {
            badgeNumber: true,
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
    }),
  ]);

  const rows = records.map((record) => ({
    id: record.id,
    code: record.code,
    email: record.email,
    status: resolveStatus(record, now),
    createdAt: record.createdAt,
    expiresAt: record.expiresAt,
    usedAt: record.usedAt,
    volunteerName: record.usedByVolunteer
      ? `${record.usedByVolunteer.user.firstName} ${record.usedByVolunteer.user.lastName}`
      : null,
    badgeNumber: record.usedByVolunteer?.badgeNumber ?? null,
  }));

  return {
    rows,
    total,
    page: filter.page,
    pageCount: Math.max(1, Math.ceil(total / INVITATIONS_PER_PAGE)),
  };
}

export async function getInvitationCounts(editionId: string): Promise<InvitationCounts> {
  const now = new Date();
  const [total, used, expired] = await Promise.all([
    db.invitationCode.count({ where: { editionId } }),
    db.invitationCode.count({
      where: { editionId, ...buildStatusFilter("used", now) },
    }),
    db.invitationCode.count({
      where: { editionId, ...buildStatusFilter("expired", now) },
    }),
  ]);

  return { total, used, expired, available: total - used - expired };
}
