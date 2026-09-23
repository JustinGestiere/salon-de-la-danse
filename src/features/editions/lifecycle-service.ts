import "server-only";

import type { Prisma } from "@/generated/prisma/client";

import { db } from "@/lib/db";
import { DomainError } from "@/lib/errors";
import { isUniqueConstraintError } from "@/lib/prisma-errors";
import { AUDIT_ACTIONS } from "@/features/audit/constants";
import { buildAuditLogData } from "@/features/audit/entries";
import type { CreateEditionInput } from "@/features/editions/admin-schemas";
import { DEFAULT_DAILY_SLOTS, DEFAULT_EVENT_DAY_COUNT } from "@/features/editions/constants";
import { addDaysToIsoDate, daysBetween, toZonedTimeOfDay, zonedLocalToUtc } from "@/features/editions/dates";

type TimeSlotSeed = { eventDate: string; position: number; startsAt: Date; endsAt: Date };

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function slotKey(eventDate: string, position: number): string {
  return `${eventDate}|${position}`;
}

function buildDefaultTimeline(firstDay: string): TimeSlotSeed[] {
  return Array.from({ length: DEFAULT_EVENT_DAY_COUNT }, (_, dayIndex) => addDaysToIsoDate(firstDay, dayIndex)).flatMap(
    (eventDate) =>
      DEFAULT_DAILY_SLOTS.map((slot) => ({
        eventDate,
        position: slot.position,
        startsAt: zonedLocalToUtc(`${eventDate}T${slot.startsAt}`),
        endsAt: zonedLocalToUtc(`${eventDate}T${slot.endsAt}`),
      })),
  );
}

async function loadSourceGrid(sourceEditionId: string) {
  return db.edition.findUnique({
    where: { id: sourceEditionId },
    select: {
      id: true,
      name: true,
      isArchived: true,
      minSlotsPerVolunteer: true,
      maxSlotsPerVolunteer: true,
      maxConsecutiveSlots: true,
      contactEmail: true,
      contactPhone: true,
      rulesMarkdown: true,
      timeSlots: {
        orderBy: [{ eventDate: "asc" }, { position: "asc" }],
        select: { id: true, eventDate: true, position: true, startsAt: true, endsAt: true },
      },
      missions: {
        orderBy: { position: "asc" },
        select: {
          name: true,
          location: true,
          description: true,
          position: true,
          isSelfBookable: true,
          missionSlots: { select: { timeSlotId: true, capacity: true, isOpen: true } },
        },
      },
    },
  });
}

type SourceGrid = NonNullable<Awaited<ReturnType<typeof loadSourceGrid>>>;

/// Décale la grille source sur les nouvelles dates en gardant l'heure de Paris
/// de chaque créneau (le changement d'heure ne décale rien).
function shiftTimeline(source: SourceGrid, firstDay: string): TimeSlotSeed[] {
  const sourceFirstDay = source.timeSlots[0] ? toIsoDate(source.timeSlots[0].eventDate) : firstDay;
  const offset = daysBetween(sourceFirstDay, firstDay);
  return source.timeSlots.map((slot) => {
    const eventDate = addDaysToIsoDate(toIsoDate(slot.eventDate), offset);
    return {
      eventDate,
      position: slot.position,
      startsAt: zonedLocalToUtc(`${eventDate}T${toZonedTimeOfDay(slot.startsAt)}`),
      endsAt: zonedLocalToUtc(`${eventDate}T${toZonedTimeOfDay(slot.endsAt)}`),
    };
  });
}

async function copyMissions(
  tx: Prisma.TransactionClient,
  editionId: string,
  source: SourceGrid,
  newSlotIdBySourceId: Map<string, string>,
): Promise<void> {
  for (const mission of source.missions) {
    const created = await tx.mission.create({
      data: {
        editionId,
        name: mission.name,
        location: mission.location,
        description: mission.description,
        position: mission.position,
        isSelfBookable: mission.isSelfBookable,
      },
      select: { id: true },
    });
    await tx.missionSlot.createMany({
      data: mission.missionSlots.flatMap((slot) => {
        const timeSlotId = newSlotIdBySourceId.get(slot.timeSlotId);
        return timeSlotId ? [{ missionId: created.id, timeSlotId, capacity: slot.capacity, isOpen: slot.isOpen }] : [];
      }),
    });
  }
}

/// Crée une édition. Avec `copyGrid`, missions, créneaux et jauges de
/// l'édition source sont repris aux nouvelles dates ; sans source ni copie, la
/// journée type est créée, sans missions. Bénévoles, codes et affectations ne
/// sont jamais repris : chaque édition repart d'une nouvelle sélection.
export async function createEdition(
  actorId: string,
  input: CreateEditionInput,
  sourceEditionId: string | null,
): Promise<{ editionId: string }> {
  const source = sourceEditionId ? await loadSourceGrid(sourceEditionId) : null;
  const shouldCopyGrid = input.copyGrid && source !== null && source.timeSlots.length > 0;
  const timeline = shouldCopyGrid && source ? shiftTimeline(source, input.firstDay) : buildDefaultTimeline(input.firstDay);

  try {
    return await db.$transaction(async (tx) => {
      const edition = await tx.edition.create({
        data: {
          name: input.name,
          slug: input.slug,
          registrationOpensAt: zonedLocalToUtc(input.opensAt),
          registrationClosesAt: zonedLocalToUtc(input.closesAt),
          ...(source
            ? {
                minSlotsPerVolunteer: source.minSlotsPerVolunteer,
                maxSlotsPerVolunteer: source.maxSlotsPerVolunteer,
                maxConsecutiveSlots: source.maxConsecutiveSlots,
              }
            : {}),
          ...(source && input.copyWelcome
            ? { contactEmail: source.contactEmail, contactPhone: source.contactPhone, rulesMarkdown: source.rulesMarkdown }
            : {}),
        },
        select: { id: true },
      });

      const createdSlots = await tx.timeSlot.createManyAndReturn({
        data: timeline.map((slot) => ({
          editionId: edition.id,
          eventDate: new Date(`${slot.eventDate}T00:00:00Z`),
          position: slot.position,
          startsAt: slot.startsAt,
          endsAt: slot.endsAt,
        })),
        select: { id: true, eventDate: true, position: true },
      });

      if (shouldCopyGrid && source) {
        const newIdByKey = new Map(createdSlots.map((slot) => [slotKey(toIsoDate(slot.eventDate), slot.position), slot.id]));
        // La grille décalée suit l'ordre des créneaux source, index par index.
        const newSlotIdBySourceId = new Map<string, string>();
        source.timeSlots.forEach((slot, index) => {
          const target = timeline[index];
          const newId = target ? newIdByKey.get(slotKey(target.eventDate, target.position)) : undefined;
          if (newId) newSlotIdBySourceId.set(slot.id, newId);
        });
        await copyMissions(tx, edition.id, source, newSlotIdBySourceId);
      }

      await tx.auditLog.create({
        data: buildAuditLogData({
          editionId: edition.id,
          actorId,
          action: AUDIT_ACTIONS.editionCreated,
          entityType: "edition",
          entityId: edition.id,
          changes: { target: input.name, after: { copiedFrom: shouldCopyGrid && source ? source.name : null } },
        }),
      });

      // Une source déjà archivée (aucune édition en cours) sert seulement de modèle.
      if (input.archiveCurrent && source && !source.isArchived) {
        await tx.edition.update({ where: { id: source.id }, data: { isArchived: true } });
        await tx.auditLog.create({
          data: buildAuditLogData({
            editionId: source.id,
            actorId,
            action: AUDIT_ACTIONS.editionArchived,
            entityType: "edition",
            entityId: source.id,
            changes: { target: source.name },
          }),
        });
      }

      return { editionId: edition.id };
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new DomainError("edition.slugTaken", "Une édition utilise déjà cet identifiant.");
    }
    throw error;
  }
}

/// Archive une édition : elle sort de l'édition active et reste consultable
/// dans la liste des éditions.
export async function archiveEdition(actorId: string, editionId: string): Promise<void> {
  const edition = await db.edition.findUnique({ where: { id: editionId }, select: { id: true, name: true, isArchived: true } });
  if (!edition) throw new DomainError("edition.notFound", "Édition introuvable.");
  if (edition.isArchived) throw new DomainError("edition.alreadyArchived", "Cette édition est déjà archivée.");

  await db.$transaction([
    db.edition.update({ where: { id: edition.id }, data: { isArchived: true } }),
    db.auditLog.create({
      data: buildAuditLogData({
        editionId: edition.id,
        actorId,
        action: AUDIT_ACTIONS.editionArchived,
        entityType: "edition",
        entityId: edition.id,
        changes: { target: edition.name },
      }),
    }),
  ]);
}
