import "server-only";

import { db } from "@/lib/db";

export type EditionSummary = {
  id: string;
  name: string;
  slug: string;
  isArchived: boolean;
  firstDay: string | null;
  lastDay: string | null;
  volunteerCount: number;
  lockedCount: number;
};

/// Toutes les éditions, archives comprises, avec leurs chiffres clés. Le volume
/// reste de quelques lignes (une par année).
export async function listEditions(): Promise<EditionSummary[]> {
  const editions = await db.edition.findMany({
    orderBy: { registrationOpensAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      isArchived: true,
      _count: { select: { volunteers: true } },
    },
  });

  const editionIds = editions.map((edition) => edition.id);
  const [dayRanges, lockedCounts] = await Promise.all([
    db.timeSlot.groupBy({
      by: ["editionId"],
      where: { editionId: { in: editionIds } },
      _min: { eventDate: true },
      _max: { eventDate: true },
    }),
    db.volunteer.groupBy({
      by: ["editionId"],
      where: { editionId: { in: editionIds }, planningStatus: "LOCKED" },
      _count: { _all: true },
    }),
  ]);

  return editions.map((edition) => {
    const range = dayRanges.find((row) => row.editionId === edition.id);
    const locked = lockedCounts.find((row) => row.editionId === edition.id);
    return {
      id: edition.id,
      name: edition.name,
      slug: edition.slug,
      isArchived: edition.isArchived,
      firstDay: range?._min.eventDate?.toISOString().slice(0, 10) ?? null,
      lastDay: range?._max.eventDate?.toISOString().slice(0, 10) ?? null,
      volunteerCount: edition._count.volunteers,
      lockedCount: locked?._count._all ?? 0,
    };
  });
}

export type MissionSettingsRow = {
  id: string;
  name: string;
  location: string | null;
  isSelfBookable: boolean;
  slotCount: number;
  minCapacity: number;
  maxCapacity: number;
};

export async function listMissionSettings(editionId: string): Promise<MissionSettingsRow[]> {
  const missions = await db.mission.findMany({
    where: { editionId },
    orderBy: { position: "asc" },
    select: {
      id: true,
      name: true,
      location: true,
      isSelfBookable: true,
      missionSlots: { select: { capacity: true } },
    },
  });

  return missions.map((mission) => {
    const capacities = mission.missionSlots.map((slot) => slot.capacity);
    return {
      id: mission.id,
      name: mission.name,
      location: mission.location,
      isSelfBookable: mission.isSelfBookable,
      slotCount: capacities.length,
      minCapacity: capacities.length > 0 ? Math.min(...capacities) : 0,
      maxCapacity: capacities.length > 0 ? Math.max(...capacities) : 0,
    };
  });
}

export type EditionReference = {
  id: string;
  name: string;
  slug: string;
};

/// Édition précise, archivée ou non : sert à consulter une édition passée.
export async function getEditionReference(editionId: string): Promise<EditionReference | null> {
  return db.edition.findUnique({ where: { id: editionId }, select: { id: true, name: true, slug: true } });
}

export type TemplateEdition = EditionReference & {
  isArchived: boolean;
  registrationOpensAt: Date;
  registrationClosesAt: Date;
};

/// Modèle de la prochaine édition : l'édition en cours, ou à défaut la plus
/// récente des archives, pour ne pas perdre la grille quand tout est archivé.
export async function getTemplateEdition(): Promise<TemplateEdition | null> {
  return db.edition.findFirst({
    orderBy: [{ isArchived: "asc" }, { registrationOpensAt: "desc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      isArchived: true,
      registrationOpensAt: true,
      registrationClosesAt: true,
    },
  });
}
