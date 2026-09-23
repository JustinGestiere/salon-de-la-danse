import "server-only";

import type { Prisma } from "@/generated/prisma/client";

import { db } from "@/lib/db";
import {
  AUDIT_CATEGORY_PREFIXES,
  AUDIT_LOGS_PER_PAGE,
  type AuditCategory,
} from "@/features/audit/constants";
import { categorizeAuditAction } from "@/features/audit/describe";
import type { AuditJournalParams } from "@/features/audit/schemas";

export type AuditJournalEntry = {
  id: string;
  createdAt: Date;
  action: string;
  category: AuditCategory | null;
  entityType: string;
  entityId: string;
  actorName: string | null;
  changes: unknown;
};

export type AuditJournalPage = {
  entries: AuditJournalEntry[];
  total: number;
  page: number;
  pageCount: number;
};

function buildCategoryWhere(category: AuditCategory | undefined): Prisma.AuditLogWhereInput {
  if (!category) return {};
  return { OR: AUDIT_CATEGORY_PREFIXES[category].map((prefix) => ({ action: { startsWith: `${prefix}.` } })) };
}

/// Journal de l'édition, du plus récent au plus ancien, paginé.
export async function listAuditEntries(editionId: string, params: AuditJournalParams): Promise<AuditJournalPage> {
  const where: Prisma.AuditLogWhereInput = { editionId, ...buildCategoryWhere(params.categorie) };
  const [total, records] = await Promise.all([
    db.auditLog.count({ where }),
    db.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (params.page - 1) * AUDIT_LOGS_PER_PAGE,
      take: AUDIT_LOGS_PER_PAGE,
      select: {
        id: true,
        createdAt: true,
        action: true,
        entityType: true,
        entityId: true,
        changes: true,
        actor: { select: { firstName: true, lastName: true } },
      },
    }),
  ]);

  return {
    entries: records.map((record) => ({
      id: record.id,
      createdAt: record.createdAt,
      action: record.action,
      category: categorizeAuditAction(record.action),
      entityType: record.entityType,
      entityId: record.entityId,
      actorName: record.actor ? `${record.actor.firstName} ${record.actor.lastName}` : null,
      changes: record.changes,
    })),
    total,
    page: params.page,
    pageCount: Math.max(1, Math.ceil(total / AUDIT_LOGS_PER_PAGE)),
  };
}

export type AuditCategoryCounts = Record<AuditCategory | "all", number>;

/// Nombre d'entrées par catégorie, pour le menu du journal. Une seule requête
/// groupée par action, ventilée ensuite par préfixe.
export async function getAuditCategoryCounts(editionId: string): Promise<AuditCategoryCounts> {
  const rows = await db.auditLog.groupBy({ by: ["action"], where: { editionId }, _count: { _all: true } });
  const counts: AuditCategoryCounts = { all: 0, volunteer: 0, assignment: 0, grid: 0, invitation: 0, edition: 0 };

  for (const row of rows) {
    counts.all += row._count._all;
    const category = categorizeAuditAction(row.action);
    if (category) counts[category] += row._count._all;
  }
  return counts;
}
