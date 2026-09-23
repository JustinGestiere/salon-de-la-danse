import type { Prisma } from "@/generated/prisma/client";

import type { AuditAction } from "@/features/audit/constants";

type AuditScalar = string | number | boolean | null;

/// Contenu du champ `changes` d'une ligne de journal. La cible est recopiée en
/// clair au moment de l'action : une affectation supprimée n'existe plus, mais
/// le journal doit pouvoir dire qui elle concernait.
export type AuditChanges = {
  target: string;
  before?: Record<string, AuditScalar>;
  after?: Record<string, AuditScalar>;
  /// Règle de planning contournée lors d'une dérogation admin.
  override?: string;
};

type AuditEntryInput = {
  editionId: string;
  actorId: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  changes: AuditChanges;
};

/// Données d'une ligne de journal, à écrire dans la même transaction que la
/// modification qu'elle trace.
export function buildAuditLogData(input: AuditEntryInput): Prisma.AuditLogUncheckedCreateInput {
  const changes: Prisma.InputJsonObject = {
    target: input.changes.target,
    ...(input.changes.before ? { before: input.changes.before } : {}),
    ...(input.changes.after ? { after: input.changes.after } : {}),
    ...(input.changes.override ? { override: input.changes.override } : {}),
  };

  return {
    editionId: input.editionId,
    actorId: input.actorId,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    changes,
  };
}
