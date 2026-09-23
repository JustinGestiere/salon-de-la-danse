import "server-only";

import { db } from "@/lib/db";
import { DomainError } from "@/lib/errors";
import { formatDateTime } from "@/lib/format";
import { isUniqueConstraintError } from "@/lib/prisma-errors";
import { AUDIT_ACTIONS } from "@/features/audit/constants";
import { buildAuditLogData } from "@/features/audit/entries";
import type {
  CreateMissionInput,
  QuotasInput,
  RegistrationWindowInput,
  WelcomeInput,
} from "@/features/editions/admin-schemas";
import { zonedLocalToUtc } from "@/features/editions/dates";

export type EditionActor = {
  editionId: string;
  editionName: string;
  actorId: string;
};

function auditEdition(actor: EditionActor, action: (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS], changes: {
  before?: Record<string, string | number | boolean | null>;
  after?: Record<string, string | number | boolean | null>;
}) {
  return db.auditLog.create({
    data: buildAuditLogData({
      editionId: actor.editionId,
      actorId: actor.actorId,
      action,
      entityType: "edition",
      entityId: actor.editionId,
      changes: { target: actor.editionName, ...changes },
    }),
  });
}

async function loadEdition(editionId: string) {
  const edition = await db.edition.findUnique({
    where: { id: editionId },
    select: {
      registrationOpensAt: true,
      registrationClosesAt: true,
      isRegistrationLocked: true,
      minSlotsPerVolunteer: true,
      maxSlotsPerVolunteer: true,
      maxConsecutiveSlots: true,
      contactEmail: true,
      contactPhone: true,
      rulesMarkdown: true,
    },
  });
  if (!edition) throw new DomainError("edition.notFound", "Édition introuvable.");
  return edition;
}

export async function updateRegistrationWindow(actor: EditionActor, input: RegistrationWindowInput): Promise<void> {
  const current = await loadEdition(actor.editionId);
  const opensAt = zonedLocalToUtc(input.opensAt);
  const closesAt = zonedLocalToUtc(input.closesAt);

  await db.$transaction([
    db.edition.update({
      where: { id: actor.editionId },
      data: { registrationOpensAt: opensAt, registrationClosesAt: closesAt },
    }),
    auditEdition(actor, AUDIT_ACTIONS.editionRegistrationUpdated, {
      before: {
        opensAt: formatDateTime(current.registrationOpensAt),
        closesAt: formatDateTime(current.registrationClosesAt),
      },
      after: { opensAt: formatDateTime(opensAt), closesAt: formatDateTime(closesAt) },
    }),
  ]);
}

/// Verrouillage manuel : fige tous les plannings, même dans la fenêtre.
export async function setRegistrationLock(actor: EditionActor, isLocked: boolean): Promise<void> {
  const current = await loadEdition(actor.editionId);
  if (current.isRegistrationLocked === isLocked) return;

  await db.$transaction([
    db.edition.update({ where: { id: actor.editionId }, data: { isRegistrationLocked: isLocked } }),
    auditEdition(actor, AUDIT_ACTIONS.editionLockUpdated, {
      before: { isRegistrationLocked: current.isRegistrationLocked },
      after: { isRegistrationLocked: isLocked },
    }),
  ]);
}

export async function updateQuotas(actor: EditionActor, input: QuotasInput): Promise<void> {
  const current = await loadEdition(actor.editionId);

  await db.$transaction([
    db.edition.update({
      where: { id: actor.editionId },
      data: {
        minSlotsPerVolunteer: input.minSlots,
        maxSlotsPerVolunteer: input.maxSlots,
        maxConsecutiveSlots: input.maxConsecutive,
      },
    }),
    auditEdition(actor, AUDIT_ACTIONS.editionQuotasUpdated, {
      before: {
        minSlots: current.minSlotsPerVolunteer,
        maxSlots: current.maxSlotsPerVolunteer,
        maxConsecutive: current.maxConsecutiveSlots,
      },
      after: { ...input },
    }),
  ]);
}

export async function updateWelcome(actor: EditionActor, input: WelcomeInput): Promise<void> {
  const current = await loadEdition(actor.editionId);
  const next = {
    contactEmail: input.contactEmail || null,
    contactPhone: input.contactPhone || null,
    rulesMarkdown: input.rulesMarkdown || null,
  };

  await db.$transaction([
    db.edition.update({ where: { id: actor.editionId }, data: next }),
    // Le texte des règles peut être long : le journal garde seulement le fait
    // qu'il a changé, pas son contenu.
    auditEdition(actor, AUDIT_ACTIONS.editionWelcomeUpdated, {
      before: {
        contactEmail: current.contactEmail,
        contactPhone: current.contactPhone,
        rulesChanged: false,
      },
      after: {
        contactEmail: next.contactEmail,
        contactPhone: next.contactPhone,
        rulesChanged: current.rulesMarkdown !== next.rulesMarkdown,
      },
    }),
  ]);
}

/// Nouvelle mission, ouverte sur tous les créneaux de l'édition avec la même
/// jauge ; chaque case s'ajuste ensuite depuis le planning.
export async function createMission(actor: EditionActor, input: CreateMissionInput): Promise<void> {
  const [timeSlots, lastMission] = await Promise.all([
    db.timeSlot.findMany({ where: { editionId: actor.editionId }, select: { id: true } }),
    db.mission.findFirst({
      where: { editionId: actor.editionId },
      orderBy: { position: "desc" },
      select: { position: true },
    }),
  ]);

  try {
    await db.$transaction(async (tx) => {
      const mission = await tx.mission.create({
        data: {
          editionId: actor.editionId,
          name: input.name,
          location: input.location || null,
          description: input.description || null,
          isSelfBookable: input.isSelfBookable,
          position: (lastMission?.position ?? 0) + 1,
        },
        select: { id: true },
      });
      await tx.missionSlot.createMany({
        data: timeSlots.map((timeSlot) => ({
          missionId: mission.id,
          timeSlotId: timeSlot.id,
          capacity: input.capacity,
        })),
      });
      await tx.auditLog.create({
        data: buildAuditLogData({
          editionId: actor.editionId,
          actorId: actor.actorId,
          action: AUDIT_ACTIONS.missionCreated,
          entityType: "mission",
          entityId: mission.id,
          changes: {
            target: input.name,
            after: { isSelfBookable: input.isSelfBookable, capacity: input.capacity },
          },
        }),
      });
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new DomainError("mission.nameTaken", "Une mission porte déjà ce nom dans cette édition.");
    }
    throw error;
  }
}

async function loadMission(editionId: string, missionId: string) {
  const mission = await db.mission.findFirst({
    where: { id: missionId, editionId },
    select: { id: true, name: true, isSelfBookable: true },
  });
  if (!mission) throw new DomainError("mission.notFound", "Mission introuvable.");
  return mission;
}

/// Passe une mission en poste sensible (attribuée par la régie) ou l'ouvre à la
/// réservation. Les affectations existantes sont conservées.
export async function setMissionAccess(actor: EditionActor, missionId: string, isSelfBookable: boolean): Promise<void> {
  const mission = await loadMission(actor.editionId, missionId);
  if (mission.isSelfBookable === isSelfBookable) return;

  await db.$transaction([
    db.mission.update({ where: { id: mission.id }, data: { isSelfBookable } }),
    db.auditLog.create({
      data: buildAuditLogData({
        editionId: actor.editionId,
        actorId: actor.actorId,
        action: AUDIT_ACTIONS.missionAccessUpdated,
        entityType: "mission",
        entityId: mission.id,
        changes: {
          target: mission.name,
          before: { isSelfBookable: mission.isSelfBookable },
          after: { isSelfBookable },
        },
      }),
    }),
  ]);
}

/// Applique la même jauge à toutes les cases d'une mission.
export async function applyMissionCapacity(actor: EditionActor, missionId: string, capacity: number): Promise<void> {
  const mission = await loadMission(actor.editionId, missionId);

  await db.$transaction([
    db.missionSlot.updateMany({ where: { missionId: mission.id }, data: { capacity } }),
    db.auditLog.create({
      data: buildAuditLogData({
        editionId: actor.editionId,
        actorId: actor.actorId,
        action: AUDIT_ACTIONS.missionCapacityApplied,
        entityType: "mission",
        entityId: mission.id,
        changes: { target: mission.name, after: { capacity } },
      }),
    }),
  ]);
}
