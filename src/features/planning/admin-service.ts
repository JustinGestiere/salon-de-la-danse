import "server-only";

import { db } from "@/lib/db";
import { DomainError } from "@/lib/errors";
import { formatEventDateShort, formatTimeRange } from "@/lib/format";
import { AUDIT_ACTIONS } from "@/features/audit/constants";
import { buildAuditLogData } from "@/features/audit/entries";
import { OVERRIDE_REQUIRED_CODE, type AssignVolunteerInput } from "@/features/planning/admin-schemas";
import { canAddCell, type SlotRules } from "@/features/planning/rules";
import { loadSelectedCells } from "@/features/planning/service";

export type PlanningActor = {
  editionId: string;
  actorId: string;
  rules: SlotRules;
};

function describeSlot(slot: { missionName: string; eventDate: Date; startsAt: Date; endsAt: Date }): string {
  const day = formatEventDateShort(slot.eventDate.toISOString().slice(0, 10));
  return `${slot.missionName}, ${day} ${formatTimeRange(slot.startsAt, slot.endsAt)}`;
}

async function loadSlot(editionId: string, missionSlotId: string) {
  const slot = await db.missionSlot.findFirst({
    where: { id: missionSlotId, mission: { editionId } },
    select: {
      id: true,
      capacity: true,
      isOpen: true,
      timeSlotId: true,
      mission: { select: { name: true } },
      timeSlot: { select: { eventDate: true, position: true, startsAt: true, endsAt: true } },
    },
  });
  if (!slot) throw new DomainError("slot.notFound", "Créneau introuvable.");
  return {
    ...slot,
    label: describeSlot({ missionName: slot.mission.name, ...slot.timeSlot }),
  };
}

function overrideRequired(reason: string): DomainError {
  return new DomainError(OVERRIDE_REQUIRED_CODE, `${reason} Confirmez pour passer outre.`);
}

/// Affectation par la régie, y compris sur les postes sensibles. Les règles du
/// planning et la jauge sont vérifiées : en cas d'écart, l'admin doit confirmer
/// (force), et la dérogation est tracée. Le double créneau reste interdit, la
/// base l'empêche de toute façon.
export async function assignVolunteerByAdmin(
  actor: PlanningActor,
  input: AssignVolunteerInput,
): Promise<{ isOverride: boolean }> {
  const slot = await loadSlot(actor.editionId, input.missionSlotId);
  const volunteer = await db.volunteer.findFirst({
    where: { id: input.volunteerId, editionId: actor.editionId },
    select: { id: true, user: { select: { firstName: true, lastName: true } } },
  });
  if (!volunteer) throw new DomainError("volunteer.notFound", "Bénévole introuvable.");

  const current = await loadSelectedCells(volunteer.id);
  if (current.some((cell) => cell.timeSlotId === slot.timeSlotId)) {
    throw new DomainError("rule.overlap", "Ce bénévole a déjà une mission sur ce créneau.");
  }

  const violation = canAddCell(
    current,
    {
      missionSlotId: slot.id,
      timeSlotId: slot.timeSlotId,
      eventDate: slot.timeSlot.eventDate.toISOString().slice(0, 10),
      position: slot.timeSlot.position,
    },
    actor.rules,
  );
  const reasons = [violation?.message, slot.isOpen ? null : "Cette case est fermée."].filter(
    (reason): reason is string => Boolean(reason),
  );
  if (reasons.length > 0 && !input.force) throw overrideRequired(reasons.join(" "));

  const volunteerName = `${volunteer.user.firstName} ${volunteer.user.lastName}`;

  return db.$transaction(async (tx) => {
    // Même verrou que la réservation bénévole : la jauge est relue sous verrou
    // pour tenir face aux inscriptions simultanées.
    await tx.$queryRaw`SELECT id FROM mission_slot WHERE id = ${slot.id} FOR UPDATE`;
    const taken = await tx.assignment.count({ where: { missionSlotId: slot.id } });
    if (taken >= slot.capacity) {
      if (!input.force) throw overrideRequired("Ce créneau est complet.");
      reasons.push("Jauge dépassée.");
    }

    const assignment = await tx.assignment.create({
      data: { volunteerId: volunteer.id, missionSlotId: slot.id, timeSlotId: slot.timeSlotId, source: "ADMIN" },
      select: { id: true },
    });
    await tx.auditLog.create({
      data: buildAuditLogData({
        editionId: actor.editionId,
        actorId: actor.actorId,
        action: AUDIT_ACTIONS.assignmentCreated,
        entityType: "assignment",
        entityId: assignment.id,
        changes: {
          target: `${volunteerName} sur ${slot.label}`,
          ...(reasons.length > 0 ? { override: reasons.join(" ") } : {}),
        },
      }),
    });
    return { isOverride: reasons.length > 0 };
  });
}

/// Retrait d'une affectation par la régie, planning verrouillé ou non.
export async function removeAssignmentByAdmin(
  actor: Omit<PlanningActor, "rules">,
  assignmentId: string,
): Promise<void> {
  const assignment = await db.assignment.findFirst({
    where: { id: assignmentId, volunteer: { editionId: actor.editionId } },
    select: {
      id: true,
      volunteer: { select: { user: { select: { firstName: true, lastName: true } } } },
      missionSlot: {
        select: {
          mission: { select: { name: true } },
          timeSlot: { select: { eventDate: true, startsAt: true, endsAt: true } },
        },
      },
    },
  });
  if (!assignment) throw new DomainError("assignment.notFound", "Affectation introuvable.");

  const { firstName, lastName } = assignment.volunteer.user;
  const slotLabel = describeSlot({
    missionName: assignment.missionSlot.mission.name,
    ...assignment.missionSlot.timeSlot,
  });

  await db.$transaction([
    db.assignment.delete({ where: { id: assignment.id } }),
    db.auditLog.create({
      data: buildAuditLogData({
        editionId: actor.editionId,
        actorId: actor.actorId,
        action: AUDIT_ACTIONS.assignmentRemoved,
        entityType: "assignment",
        entityId: assignment.id,
        changes: { target: `${firstName} ${lastName} de ${slotLabel}` },
      }),
    }),
  ]);
}

/// Jauge d'une case. Descendre sous le nombre d'inscrits est permis : personne
/// n'est retiré d'office, la régie arbitre à la main.
export async function updateSlotCapacity(
  actor: Omit<PlanningActor, "rules">,
  missionSlotId: string,
  capacity: number,
): Promise<void> {
  const slot = await loadSlot(actor.editionId, missionSlotId);
  if (slot.capacity === capacity) return;

  await db.$transaction([
    db.missionSlot.update({ where: { id: slot.id }, data: { capacity } }),
    db.auditLog.create({
      data: buildAuditLogData({
        editionId: actor.editionId,
        actorId: actor.actorId,
        action: AUDIT_ACTIONS.missionSlotCapacityUpdated,
        entityType: "missionSlot",
        entityId: slot.id,
        changes: { target: slot.label, before: { capacity: slot.capacity }, after: { capacity } },
      }),
    }),
  ]);
}

/// Ouvre ou ferme une case à la réservation bénévole.
export async function setSlotOpen(
  actor: Omit<PlanningActor, "rules">,
  missionSlotId: string,
  isOpen: boolean,
): Promise<void> {
  const slot = await loadSlot(actor.editionId, missionSlotId);
  if (slot.isOpen === isOpen) return;

  await db.$transaction([
    db.missionSlot.update({ where: { id: slot.id }, data: { isOpen } }),
    db.auditLog.create({
      data: buildAuditLogData({
        editionId: actor.editionId,
        actorId: actor.actorId,
        action: AUDIT_ACTIONS.missionSlotOpeningUpdated,
        entityType: "missionSlot",
        entityId: slot.id,
        changes: { target: slot.label, before: { isOpen: slot.isOpen }, after: { isOpen } },
      }),
    }),
  ]);
}
