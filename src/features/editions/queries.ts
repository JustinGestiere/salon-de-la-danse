import "server-only";

import { db } from "@/lib/db";

export type ActiveEdition = {
  id: string;
  name: string;
  slug: string;
  registrationOpensAt: Date;
  registrationClosesAt: Date;
  isRegistrationLocked: boolean;
  minSlotsPerVolunteer: number;
  maxSlotsPerVolunteer: number;
  maxConsecutiveSlots: number;
  contactEmail: string | null;
  contactPhone: string | null;
  rulesMarkdown: string | null;
};

/// L'edition « courante » cote benevole : la plus recente non archivee. Le
/// projet est mono-edition active a la fois, l'archivage sortant les anciennes.
export async function getActiveEdition(): Promise<ActiveEdition | null> {
  return db.edition.findFirst({
    where: { isArchived: false },
    orderBy: { registrationOpensAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
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
}

/// Jours de l'édition (dates distinctes des créneaux), triés. Sert au
/// dashboard d'onboarding.
export async function getEditionDays(editionId: string): Promise<string[]> {
  const timeSlots = await db.timeSlot.findMany({
    where: { editionId },
    select: { eventDate: true },
    orderBy: { eventDate: "asc" },
  });
  const days = new Set(timeSlots.map((slot) => slot.eventDate.toISOString().slice(0, 10)));
  return [...days];
}

/// Le planning est-il modifiable ? Vrai seulement dans la fenetre d'inscription
/// et tant que l'admin n'a pas verrouille globalement.
export function isRegistrationOpen(
  edition: Pick<
    ActiveEdition,
    "registrationOpensAt" | "registrationClosesAt" | "isRegistrationLocked"
  >,
  now: Date = new Date(),
): boolean {
  if (edition.isRegistrationLocked) return false;
  return now >= edition.registrationOpensAt && now <= edition.registrationClosesAt;
}

/// Début du premier créneau de l'édition : le « lever de rideau ». Null tant
/// que la grille n'est pas créée.
export async function getEditionStart(editionId: string): Promise<Date | null> {
  const firstSlot = await db.timeSlot.findFirst({
    where: { editionId },
    orderBy: { startsAt: "asc" },
    select: { startsAt: true },
  });
  return firstSlot?.startsAt ?? null;
}
