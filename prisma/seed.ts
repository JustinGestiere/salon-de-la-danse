import { config as loadEnv } from "dotenv";
import { hashPassword } from "better-auth/crypto";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client.js";
import {
  canAddCell,
  type SelectedCell,
  type SlotRules,
} from "../src/features/planning/rules.js";

loadEnv();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL manquant : impossible de semer la base.");
}

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const DEMO_PASSWORD = "SalonDemo2027!";
const CEST_OFFSET_HOURS = 2; // Mai 2027 : Europe/Paris = UTC+2.

// Créneaux de la journée type. Le premier est plus court (voir schema.prisma).
const DAILY_SLOTS: { position: number; start: [number, number]; end: [number, number] }[] = [
  { position: 1, start: [8, 30], end: [10, 0] },
  { position: 2, start: [10, 0], end: [12, 0] },
  { position: 3, start: [12, 0], end: [14, 0] },
  { position: 4, start: [14, 0], end: [16, 0] },
  { position: 5, start: [16, 0], end: [18, 0] },
];

const EVENT_DAYS = ["2027-05-14", "2027-05-15", "2027-05-16"];

// --------------------------------------------------------------------------
// Remplissage de démonstration
// --------------------------------------------------------------------------
// Sans bénévoles fictifs, toutes les jauges sortent vertes et les compteurs du
// back-office affichent zéro. Les taux ci-dessous sont une table fixe plutôt
// qu'un tirage aléatoire : le jeu de démonstration doit être identique à chaque
// seed, sinon impossible de préparer une démonstration.

/// Taux de remplissage visé par créneau. Choisis pour que la grille montre les
/// trois états de jauge : libre, tendu, complet.
const FILL_RATIO_BY_POSITION: Record<number, number> = {
  1: 0.3,
  2: 0.9,
  3: 1,
  4: 0.55,
  5: 0.75,
};

/// Affluence relative par journée : le samedi est le pic du salon.
const FILL_RATIO_BY_DAY: Record<string, number> = {
  "2027-05-14": 0.7,
  "2027-05-15": 1,
  "2027-05-16": 0.85,
};

/// Garde-fou : le salon compte environ 130 bénévoles. La boucle s'arrête d'elle
/// même dès que tous les objectifs de remplissage sont atteints.
const MAX_FILLER_VOLUNTEERS = 130;

/// Nombre d'affectations forcées par un administrateur sur les postes sensibles
/// (Billetterie, Caisse), pour que le back-office ait de quoi montrer.
const ADMIN_ASSIGNED_COUNT = 8;

const FILLER_RULES: SlotRules = { minSlots: 1, maxSlots: 3, maxConsecutive: 2 };

const FILLER_FIRST_NAMES = [
  "Camille", "Lucas", "Inès", "Nathan", "Jade", "Hugo", "Léa", "Malo",
  "Anaïs", "Théo", "Manon", "Yanis", "Sarah", "Enzo", "Louise", "Adam",
  "Clara", "Noé", "Zoé", "Ilan",
];

const FILLER_LAST_NAMES = [
  "Bertin", "Chauvet", "Doucet", "Fournier", "Gicquel", "Hamon", "Jolivet",
  "Lebreton", "Moreau", "Perrin", "Renou", "Sauvage", "Thibault", "Vallée",
];

type TimeSlotRow = { id: string; eventDate: string; position: number };

type MissionSeed = {
  name: string;
  location: string;
  position: number;
  capacity: number;
  selfBookable: boolean;
  description: string;
  /// Attractivité relative de la mission, appliquée au taux de remplissage.
  popularity: number;
};

/// Une case de la grille suivie pendant le remplissage de démonstration.
type FillCell = {
  missionSlotId: string;
  timeSlotId: string;
  eventDate: string;
  position: number;
  capacity: number;
  /// Nombre de places que le seed cherche à occuper sur cette case.
  target: number;
  taken: number;
};

type FillerRecord = {
  volunteerId: string;
  selection: SelectedCell[];
};

function utc(isoDate: string, hour: number, minute: number): Date {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(year!, month! - 1, day!, hour - CEST_OFFSET_HOURS, minute));
}

/// Le hachage d'un mot de passe est volontairement coûteux. On ne le calcule
/// donc qu'une fois pour tous les comptes de démonstration.
let cachedPasswordHash: string | null = null;
async function getDemoPasswordHash(): Promise<string> {
  const cached = cachedPasswordHash;
  if (cached !== null) return cached;

  const hash = await hashPassword(DEMO_PASSWORD);
  cachedPasswordHash = hash;
  return hash;
}

async function createUser(input: {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: "ADMIN" | "VOLUNTEER";
  birthDate?: Date;
}): Promise<string> {
  const user = await db.user.create({
    data: {
      email: input.email,
      name: `${input.firstName} ${input.lastName}`,
      emailVerified: true,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      role: input.role,
      birthDate: input.birthDate ?? null,
    },
    select: { id: true },
  });

  await db.account.create({
    data: {
      accountId: user.id,
      providerId: "credential",
      userId: user.id,
      password: await getDemoPasswordHash(),
    },
  });

  return user.id;
}

async function resetDatabase(): Promise<void> {
  // Ordre respectant les clés étrangères. Réservé au seed de développement.
  await db.assignment.deleteMany();
  await db.missionSlot.deleteMany();
  await db.timeSlot.deleteMany();
  await db.mission.deleteMany();
  await db.invitationCode.deleteMany();
  await db.volunteer.deleteMany();
  await db.auditLog.deleteMany();
  await db.account.deleteMany();
  await db.session.deleteMany();
  await db.user.deleteMany();
  await db.edition.deleteMany();
}

const MISSIONS: MissionSeed[] = [
  { name: "Accueil", location: "Hall d'entrée", position: 1, capacity: 6, selfBookable: true, popularity: 1, description: "Accueillir et orienter le public." },
  { name: "Vestiaire", location: "Niveau 0", position: 2, capacity: 4, selfBookable: true, popularity: 0.8, description: "Gestion des vestiaires." },
  { name: "Bar / Restauration", location: "Niveau 0", position: 3, capacity: 5, selfBookable: true, popularity: 0.95, description: "Service au bar et snacking." },
  { name: "Logistique / Montage", location: "Niveau -2", position: 4, capacity: 4, selfBookable: true, popularity: 0.6, description: "Aide au montage et à la logistique." },
  { name: "Orientation public", location: "Étages", position: 5, capacity: 4, selfBookable: true, popularity: 0.75, description: "Guider le public entre les salles." },
  { name: "Billetterie", location: "Entrée", position: 6, capacity: 3, selfBookable: false, popularity: 0, description: "Poste sensible : attribution par un admin." },
  { name: "Caisse", location: "Entrée", position: 7, capacity: 2, selfBookable: false, popularity: 0, description: "Poste sensible : attribution par un admin." },
];

function computeTarget(cell: Omit<FillCell, "target" | "taken">, popularity: number): number {
  const slotRatio = FILL_RATIO_BY_POSITION[cell.position] ?? 0.5;
  const dayRatio = FILL_RATIO_BY_DAY[cell.eventDate] ?? 0.8;
  const target = Math.round(cell.capacity * slotRatio * dayRatio * popularity);
  return Math.min(Math.max(target, 0), cell.capacity);
}

/// Tri déterministe : d'abord les cases les plus en retard sur leur objectif,
/// puis un ordre stable pour que deux seeds produisent exactement le même jeu.
function compareByDeficit(left: FillCell, right: FillCell): number {
  const deficit = right.target - right.taken - (left.target - left.taken);
  if (deficit !== 0) return deficit;
  return (
    left.eventDate.localeCompare(right.eventDate) ||
    left.position - right.position ||
    left.missionSlotId.localeCompare(right.missionSlotId)
  );
}

function toSelectedCell(cell: FillCell): SelectedCell {
  return {
    missionSlotId: cell.missionSlotId,
    timeSlotId: cell.timeSlotId,
    eventDate: cell.eventDate,
    position: cell.position,
  };
}

/// Répartit des bénévoles fictifs sur les cases en retard, en respectant les
/// mêmes règles métier que l'application (canAddCell) : le jeu de démonstration
/// ne peut donc pas contenir de planning que l'application refuserait.
function planFillerSelections(cells: FillCell[]): FillCell[][] {
  const plans: FillCell[][] = [];

  for (let index = 0; index < MAX_FILLER_VOLUNTEERS; index += 1) {
    const candidates = cells
      .filter((cell) => cell.taken < cell.target)
      .sort(compareByDeficit);
    if (candidates.length === 0) break;

    const selection: SelectedCell[] = [];
    const chosen: FillCell[] = [];
    for (const cell of candidates) {
      if (chosen.length >= FILLER_RULES.maxSlots) break;
      if (canAddCell(selection, toSelectedCell(cell), FILLER_RULES) !== null) continue;
      selection.push(toSelectedCell(cell));
      chosen.push(cell);
    }

    if (chosen.length === 0) break;
    for (const cell of chosen) cell.taken += 1;
    plans.push(chosen);
  }

  return plans;
}

async function seedFillerVolunteers(
  editionId: string,
  cells: FillCell[],
): Promise<FillerRecord[]> {
  // Les bénévoles nommés ont déjà pris des places : on part de l'état réel de
  // la base plutôt que de zéro, sinon on dépasserait les capacités.
  const existing = await db.assignment.groupBy({
    by: ["missionSlotId"],
    _count: { _all: true },
  });
  const takenByCell = new Map(existing.map((row) => [row.missionSlotId, row._count._all]));
  for (const cell of cells) {
    cell.taken = takenByCell.get(cell.missionSlotId) ?? 0;
  }

  const plans = planFillerSelections(cells);
  const records: FillerRecord[] = [];

  for (const [index, plan] of plans.entries()) {
    const firstName = FILLER_FIRST_NAMES[index % FILLER_FIRST_NAMES.length] ?? "Camille";
    const lastName = FILLER_LAST_NAMES[index % FILLER_LAST_NAMES.length] ?? "Bertin";
    const reference = String(index + 1).padStart(3, "0");

    const userId = await createUser({
      email: `benevole-${reference}@salon-danse.example`,
      firstName,
      lastName,
      phone: "0600000000",
      role: "VOLUNTEER",
      birthDate: new Date("1996-03-21T00:00:00Z"),
    });

    // Deux tiers des plannings sont validés : le back-office doit pouvoir
    // distinguer « validés » et « en attente ».
    const isLocked = index % 3 !== 0;

    const volunteer = await db.volunteer.create({
      data: {
        userId,
        editionId,
        badgeNumber: `BEN-F${reference}`,
        planningStatus: isLocked ? "LOCKED" : "DRAFT",
        lockedAt: isLocked ? new Date() : null,
      },
      select: { id: true },
    });

    await db.invitationCode.create({
      data: {
        editionId,
        code: `INV-F${reference}`,
        email: `benevole-${reference}@salon-danse.example`,
        usedAt: new Date(),
        usedByVolunteerId: volunteer.id,
      },
    });

    await db.assignment.createMany({
      data: plan.map((cell) => ({
        volunteerId: volunteer.id,
        missionSlotId: cell.missionSlotId,
        timeSlotId: cell.timeSlotId,
        source: "SELF" as const,
      })),
    });

    records.push({ volunteerId: volunteer.id, selection: plan.map(toSelectedCell) });
  }

  return records;
}

/// Attribue quelques postes sensibles à la main, comme le ferait un
/// administrateur : ces cases ne sont pas réservables en libre-service.
async function seedAdminAssignments(
  editionId: string,
  fillers: FillerRecord[],
): Promise<number> {
  const restrictedSlots = await db.missionSlot.findMany({
    where: { isOpen: true, mission: { editionId, isSelfBookable: false } },
    select: {
      id: true,
      timeSlotId: true,
      timeSlot: { select: { eventDate: true, position: true } },
    },
    orderBy: [{ timeSlot: { eventDate: "asc" } }, { timeSlot: { position: "asc" } }],
    take: ADMIN_ASSIGNED_COUNT,
  });

  let assigned = 0;
  for (const slot of restrictedSlots) {
    const candidate: SelectedCell = {
      missionSlotId: slot.id,
      timeSlotId: slot.timeSlotId,
      eventDate: slot.timeSlot.eventDate.toISOString().slice(0, 10),
      position: slot.timeSlot.position,
    };

    const host = fillers.find(
      (filler) => canAddCell(filler.selection, candidate, FILLER_RULES) === null,
    );
    if (!host) continue;

    await db.assignment.create({
      data: {
        volunteerId: host.volunteerId,
        missionSlotId: candidate.missionSlotId,
        timeSlotId: candidate.timeSlotId,
        source: "ADMIN",
      },
    });
    host.selection.push(candidate);
    assigned += 1;
  }

  return assigned;
}

async function main(): Promise<void> {
  await resetDatabase();

  const now = new Date();
  const edition = await db.edition.create({
    data: {
      name: "Salon de la Danse 2027",
      slug: "salon-2027",
      registrationOpensAt: new Date(now.getTime() - 7 * 24 * 3600 * 1000),
      registrationClosesAt: new Date(now.getTime() + 60 * 24 * 3600 * 1000),
      minSlotsPerVolunteer: 1,
      maxSlotsPerVolunteer: 3,
      maxConsecutiveSlots: 2,
      contactEmail: "benevoles@salon-danse.example",
      contactPhone: "01 23 45 67 89",
      rulesMarkdown:
        "Merci de votre engagement ! Présentez-vous 15 minutes avant votre premier créneau.",
    },
    select: { id: true },
  });

  const timeSlots: TimeSlotRow[] = [];
  for (const day of EVENT_DAYS) {
    for (const slot of DAILY_SLOTS) {
      const created = await db.timeSlot.create({
        data: {
          editionId: edition.id,
          eventDate: new Date(`${day}T00:00:00Z`),
          position: slot.position,
          startsAt: utc(day, slot.start[0], slot.start[1]),
          endsAt: utc(day, slot.end[0], slot.end[1]),
        },
        select: { id: true },
      });
      timeSlots.push({ id: created.id, eventDate: day, position: slot.position });
    }
  }

  const fillCells: FillCell[] = [];
  for (const mission of MISSIONS) {
    const createdMission = await db.mission.create({
      data: {
        editionId: edition.id,
        name: mission.name,
        location: mission.location,
        description: mission.description,
        position: mission.position,
        isSelfBookable: mission.selfBookable,
      },
      select: { id: true },
    });

    for (const timeSlot of timeSlots) {
      const slot = await db.missionSlot.create({
        data: {
          missionId: createdMission.id,
          timeSlotId: timeSlot.id,
          capacity: mission.capacity,
        },
        select: { id: true },
      });
      if (!mission.selfBookable) continue;

      const base = {
        missionSlotId: slot.id,
        timeSlotId: timeSlot.id,
        eventDate: timeSlot.eventDate,
        position: timeSlot.position,
        capacity: mission.capacity,
      };
      fillCells.push({ ...base, target: computeTarget(base, mission.popularity), taken: 0 });
    }
  }

  await createUser({
    email: "admin@salon-danse.example",
    firstName: "Alice",
    lastName: "Admin",
    phone: "0600000001",
    role: "ADMIN",
  });

  await seedVolunteers(edition.id, timeSlots);
  const fillers = await seedFillerVolunteers(edition.id, fillCells);
  const adminAssigned = await seedAdminAssignments(edition.id, fillers);
  await seedInvitationCodes(edition.id);

  const seats = fillCells.reduce((total, cell) => total + cell.taken, 0);
  const capacity = fillCells.reduce((total, cell) => total + cell.capacity, 0);

  console.log("Seed terminé.");
  console.log(
    `Grille : ${seats}/${capacity} places réservées en libre-service, ` +
      `${adminAssigned} postes sensibles attribués par l'admin.`,
  );
  console.log(`Bénévoles fictifs : ${fillers.length} (en plus des 3 comptes nommés).`);
  console.log(`Comptes démo (mot de passe : ${DEMO_PASSWORD}) :`);
  console.log("  - admin@salon-danse.example (ADMIN)");
  console.log("  - benevole1@salon-danse.example (brouillon vide)");
  console.log("  - benevole2@salon-danse.example (brouillon avec créneaux)");
  console.log("  - benevole3@salon-danse.example (planning validé)");
  console.log("Codes d'invitation libres : DEMO-ALPHA, DEMO-BRAVO, DEMO-CHARLIE");
}

async function seedVolunteers(
  editionId: string,
  timeSlots: readonly TimeSlotRow[],
): Promise<void> {
  const volunteers = [
    { email: "benevole1@salon-danse.example", first: "Bruno", badge: "BEN-DEMO1", locked: false, slots: [] as [string, number][] },
    {
      email: "benevole2@salon-danse.example",
      first: "Chloé",
      badge: "BEN-DEMO2",
      locked: false,
      slots: [["2027-05-14", 1], ["2027-05-14", 3]] as [string, number][],
    },
    {
      email: "benevole3@salon-danse.example",
      first: "David",
      badge: "BEN-DEMO3",
      locked: true,
      slots: [["2027-05-15", 2], ["2027-05-16", 4]] as [string, number][],
    },
  ];

  for (const item of volunteers) {
    const userId = await createUser({
      email: item.email,
      firstName: item.first,
      lastName: "Bénévole",
      phone: "0600000002",
      role: "VOLUNTEER",
      birthDate: new Date("1998-06-15T00:00:00Z"),
    });

    const volunteer = await db.volunteer.create({
      data: {
        userId,
        editionId,
        badgeNumber: item.badge,
        planningStatus: item.locked ? "LOCKED" : "DRAFT",
        lockedAt: item.locked ? new Date() : null,
      },
      select: { id: true },
    });

    for (const [day, position] of item.slots) {
      const timeSlot = timeSlots.find(
        (slot) => slot.eventDate === day && slot.position === position,
      );
      if (!timeSlot) continue;

      // orderBy explicite : sans lui, la mission retenue varie d'un seed à
      // l'autre et le jeu de démonstration n'est plus reproductible.
      const missionSlot = await db.missionSlot.findFirst({
        where: { timeSlotId: timeSlot.id, mission: { isSelfBookable: true } },
        orderBy: { mission: { position: "asc" } },
        select: { id: true, timeSlotId: true },
      });
      if (!missionSlot) continue;

      await db.assignment.create({
        data: {
          volunteerId: volunteer.id,
          missionSlotId: missionSlot.id,
          timeSlotId: missionSlot.timeSlotId,
          source: "SELF",
        },
      });
    }
  }
}

async function seedInvitationCodes(editionId: string): Promise<void> {
  const codes = ["DEMO-ALPHA", "DEMO-BRAVO", "DEMO-CHARLIE"];
  for (const code of codes) {
    await db.invitationCode.create({
      data: { editionId, code, email: null },
    });
  }
}

main()
  .then(() => db.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await db.$disconnect();
    process.exit(1);
  });
