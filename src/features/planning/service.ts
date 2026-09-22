import "server-only";

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

/// Charge la sélection courante du bénévole sous la forme attendue par les
/// règles métier.
async function loadSelectedCells(volunteerId: string): Promise<SelectedCell[]> {
  const assignments = await db.assignment.findMany({
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

/// Garde-fou commun : le planning n'est modifiable qu'en brouillon.
function assertDraft(planningStatus: "DRAFT" | "LOCKED"): void {
  if (planningStatus === "LOCKED") {
    throw new DomainError(
      "planning.locked",
      "Votre planning est validé. Contactez un administrateur pour le modifier.",
    );
  }
}

async function loadOpenSelfBookableSlot(missionSlotId: string, editionId: string) {
  const slot = await db.missionSlot.findFirst({
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

/// Ajoute une case au brouillon. Toutes les règles sont revérifiées côté
/// serveur, la jauge est contrôlée dans la transaction pour tenir face à des
/// réservations concurrentes.
async function addAssignment(
  context: VolunteerContext,
  missionSlotId: string,
): Promise<void> {
  const slot = await loadOpenSelfBookableSlot(missionSlotId, context.editionId);
  const current = await loadSelectedCells(context.volunteerId);

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

  await db.$transaction(async (tx) => {
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
  });
}

/// Ajoute ou retire une case selon qu'elle est déjà sélectionnée (mode
/// brouillon interactif). Renvoie l'état résultant de la case.
export async function toggleAssignment(
  context: VolunteerContext,
  planningStatus: "DRAFT" | "LOCKED",
  missionSlotId: string,
): Promise<{ selected: boolean }> {
  assertDraft(planningStatus);

  const existing = await db.assignment.findFirst({
    where: { volunteerId: context.volunteerId, missionSlotId },
    select: { id: true },
  });

  if (existing) {
    await db.assignment.delete({ where: { id: existing.id } });
    return { selected: false };
  }

  await addAssignment(context, missionSlotId);
  return { selected: true };
}

/// Validation définitive : dernier contrôle des règles, puis verrouillage.
export async function lockPlanning(
  context: VolunteerContext,
  planningStatus: "DRAFT" | "LOCKED",
): Promise<void> {
  assertDraft(planningStatus);

  const cells = await loadSelectedCells(context.volunteerId);
  const violations = validateSelection(cells, context.rules);
  if (violations.length > 0) {
    const first = violations[0]!;
    throw new DomainError(`rule.${first.code}`, first.message);
  }

  await db.volunteer.update({
    where: { id: context.volunteerId },
    data: { planningStatus: "LOCKED", lockedAt: new Date() },
  });
}
