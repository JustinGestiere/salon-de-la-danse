import { randomUUID } from "node:crypto";

import { config as loadEnv } from "dotenv";
import { hashPassword } from "better-auth/crypto";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client.js";

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

function utc(isoDate: string, hour: number, minute: number): Date {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(year!, month! - 1, day!, hour - CEST_OFFSET_HOURS, minute));
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
      password: await hashPassword(DEMO_PASSWORD),
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

  const timeSlotIds = new Map<string, string>();
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
      timeSlotIds.set(`${day}:${slot.position}`, created.id);
    }
  }

  const missions = [
    { name: "Accueil", location: "Hall d'entrée", position: 1, capacity: 6, selfBookable: true, description: "Accueillir et orienter le public." },
    { name: "Vestiaire", location: "Niveau 0", position: 2, capacity: 4, selfBookable: true, description: "Gestion des vestiaires." },
    { name: "Bar / Restauration", location: "Niveau 0", position: 3, capacity: 5, selfBookable: true, description: "Service au bar et snacking." },
    { name: "Logistique / Montage", location: "Niveau -2", position: 4, capacity: 4, selfBookable: true, description: "Aide au montage et à la logistique." },
    { name: "Orientation public", location: "Étages", position: 5, capacity: 4, selfBookable: true, description: "Guider le public entre les salles." },
    { name: "Billetterie", location: "Entrée", position: 6, capacity: 3, selfBookable: false, description: "Poste sensible : attribution par un admin." },
    { name: "Caisse", location: "Entrée", position: 7, capacity: 2, selfBookable: false, description: "Poste sensible : attribution par un admin." },
  ];

  const missionSlotIds: string[] = [];
  for (const mission of missions) {
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

    for (const timeSlotId of timeSlotIds.values()) {
      const slot = await db.missionSlot.create({
        data: { missionId: createdMission.id, timeSlotId, capacity: mission.capacity },
        select: { id: true },
      });
      if (mission.selfBookable) missionSlotIds.push(slot.id);
    }
  }

  await createUser({
    email: "admin@salon-danse.example",
    firstName: "Alice",
    lastName: "Admin",
    phone: "0600000001",
    role: "ADMIN",
  });

  await seedVolunteers(edition.id, timeSlotIds);
  await seedInvitationCodes(edition.id);

  console.log("Seed terminé.");
  console.log(`Comptes démo (mot de passe : ${DEMO_PASSWORD}) :`);
  console.log("  - admin@salon-danse.example (ADMIN)");
  console.log("  - benevole1@salon-danse.example (brouillon vide)");
  console.log("  - benevole2@salon-danse.example (brouillon avec créneaux)");
  console.log("  - benevole3@salon-danse.example (planning validé)");
  console.log("Codes d'invitation libres : DEMO-ALPHA, DEMO-BRAVO, DEMO-CHARLIE");
}

async function seedVolunteers(
  editionId: string,
  timeSlotIds: Map<string, string>,
): Promise<void> {
  const volunteers = [
    { email: "benevole1@salon-danse.example", first: "Bruno", badge: "BEN-DEMO1", locked: false, slots: [] as string[] },
    {
      email: "benevole2@salon-danse.example",
      first: "Chloé",
      badge: "BEN-DEMO2",
      locked: false,
      slots: ["2027-05-14:1", "2027-05-14:3"],
    },
    {
      email: "benevole3@salon-danse.example",
      first: "David",
      badge: "BEN-DEMO3",
      locked: true,
      slots: ["2027-05-15:2", "2027-05-16:4"],
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

    for (const key of item.slots) {
      const timeSlotId = timeSlotIds.get(key);
      if (!timeSlotId) continue;
      const missionSlot = await db.missionSlot.findFirst({
        where: { timeSlotId, mission: { isSelfBookable: true } },
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
      data: { editionId, code, email: null, id: randomUUID() },
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
