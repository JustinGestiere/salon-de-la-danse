import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { DomainError } from "@/lib/errors";
import {
  canAddCell,
  validateSelection,
  type SelectedCell,
  type SlotRules,
} from "@/features/planning/rules";

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

type VolunteerContext = {
  volunteerId: string;
  editionId: string;
  rules: SlotRules;
};

type Transaction = Prisma.TransactionClient;

/// Verrouille la ligne du bénévole pour la durée de la transaction, puis
/// vérifie que son planning est encore en brouillon.
///
/// Sans ce verrou, deux requêtes simultanées du même bénévole lisent chacune
/// l'ancienne sélection et passent toutes les deux les règles (maximum de
/// créneaux, créneaux consécutifs), ou une réservation passe pendant la
/// validation définitive. Le statut est relu après le verrou pour la même
/// raison : celui chargé par la Server Action peut déjà être périmé.
async function lockDraftPlanning(tx: Transaction, volunteerId: string): Promise<void> {
  await tx.$queryRaw`SELECT id FROM volunteer WHERE id = ${volunteerId} FOR UPDATE`;

  const volunteer = await tx.volunteer.findUnique({
    where: { id: volunteerId },
    select: { planningStatus: true },
  });
  if (!volunteer) {
    throw new DomainError("volunteer.none", "Participation introuvable.");
  }
  if (volunteer.planningStatus === "LOCKED") {
    throw new DomainError(
      "planning.locked",
      "Votre planning est validé. Contactez un administrateur pour le modifier.",
    );
  }
}

/// Charge la sélection courante du bénévole sous la forme attendue par les
/// règles métier.
async function loadSelectedCells(tx: Transaction, volunteerId: string): Promise<SelectedCell[]> {
  const assignments = await tx.assignment.findMany({
    where: { volunteerId },
    select: {
      missionSlotId: true,
      timeSlotId: true,
      missionSlot: {
        select: { timeSlot: { select: { eventDate: true, position: true } } },
      },
    },
  });

  return assignments.map((assignment) => ({
    missionSlotId: assignment.missionSlotId,
    timeSlotId: assignment.timeSlotId,
    eventDate: toIsoDate(assignment.missionSlot.timeSlot.eventDate),
    position: assignment.missionSlot.timeSlot.position,
  }));
}

async function loadOpenSelfBookableSlot(
  tx: Transaction,
  missionSlotId: string,
  editionId: string,
) {
  const slot = await tx.missionSlot.findFirst({
    where: {
      id: missionSlotId,
      isOpen: true,
      mission: { editionId, isSelfBookable: true },
    },
    select: {
      id: true,
      capacity: true,
      timeSlotId: true,
      timeSlot: { select: { eventDate: true, position: true } },
    },
  });

  if (!slot) {
    throw new DomainError("slot.notFound", "Cette mission n'est pas disponible.");
  }
  return slot;
}

/// Ajoute une case au brouillon. Appelée sous le verrou du bénévole : les
/// règles sont vérifiées sur sa sélection à jour.
async function addAssignment(
  tx: Transaction,
  context: VolunteerContext,
  missionSlotId: string,
): Promise<void> {
  const slot = await loadOpenSelfBookableSlot(tx, missionSlotId, context.editionId);
  const current = await loadSelectedCells(tx, context.volunteerId);

  const candidate: SelectedCell = {
    missionSlotId: slot.id,
    timeSlotId: slot.timeSlotId,
    eventDate: toIsoDate(slot.timeSlot.eventDate),
    position: slot.timeSlot.position,
  };

  const violation = canAddCell(current, candidate, context.rules);
  if (violation) {
    throw new DomainError(`rule.${violation.code}`, violation.message);
  }

  // Verrou de ligne avant de compter. Sans lui, deux réservations
  // simultanées sur la dernière place lisent toutes les deux capacity - 1 et
  // s'insèrent toutes les deux : PostgreSQL est en Read Committed par défaut
  // et la contrainte unique ne couvre que le double-booking d'un même
  // bénévole, pas le dépassement de jauge.
  await tx.$queryRaw`SELECT id FROM mission_slot WHERE id = ${slot.id} FOR UPDATE`;

  const taken = await tx.assignment.count({ where: { missionSlotId: slot.id } });
  if (taken >= slot.capacity) {
    throw new DomainError("slot.full", "Cette mission est complète.");
  }
  await tx.assignment.create({
    data: {
      volunteerId: context.volunteerId,
      missionSlotId: slot.id,
      timeSlotId: slot.timeSlotId,
      source: "SELF",
    },
  });
}

/// Ajoute ou retire une case selon qu'elle est déjà sélectionnée (mode
/// brouillon interactif). Renvoie l'état résultant de la case.
export async function toggleAssignment(
  context: VolunteerContext,
  missionSlotId: string,
): Promise<{ selected: boolean }> {
  return db.$transaction(async (tx) => {
    await lockDraftPlanning(tx, context.volunteerId);

    const existing = await tx.assignment.findFirst({
      where: { volunteerId: context.volunteerId, missionSlotId },
      select: { id: true },
    });

    if (!existing) {
      await addAssignment(tx, context, missionSlotId);
      return { selected: true };
    }

    await tx.assignment.delete({ where: { id: existing.id } });
    return { selected: false };
  });
}

/// Validation définitive : dernier contrôle des règles, puis verrouillage.
export async function lockPlanning(context: VolunteerContext): Promise<void> {
  await db.$transaction(async (tx) => {
    await lockDraftPlanning(tx, context.volunteerId);

    const cells = await loadSelectedCells(tx, context.volunteerId);
    const [firstViolation] = validateSelection(cells, context.rules);
    if (firstViolation) {
      throw new DomainError(`rule.${firstViolation.code}`, firstViolation.message);
    }

    await tx.volunteer.update({
      where: { id: context.volunteerId },
      data: { planningStatus: "LOCKED", lockedAt: new Date() },
    });
  });
}
