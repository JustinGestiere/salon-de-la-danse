import "server-only";

import { db } from "@/lib/db";
import { formatEventDateShort, formatTimeRange } from "@/lib/format";
import { buildVolunteerWhere } from "@/features/volunteers/admin-queries";
import { deriveVolunteerStatus, isMinorOn, VOLUNTEER_STATUS_LABELS } from "@/features/volunteers/status";
import type { PlanningExportParams, VolunteerExportParams } from "@/features/exports/schemas";
import { MAX_EXPORT_ROWS, type ExportTable } from "@/features/exports/table";

const VOLUNTEER_COLUMNS = [
  { header: "Badge", width: 14 },
  { header: "Nom", width: 20 },
  { header: "Prénom", width: 18 },
  { header: "E-mail", width: 32 },
  { header: "Téléphone", width: 16 },
  { header: "Statut du planning", width: 20 },
  { header: "Créneaux", width: 10 },
  { header: "Missions", width: 40 },
  { header: "Photo", width: 10 },
  { header: "Mineur à valider", width: 16 },
] as const;

/// Liste des bénévoles filtrée comme à l'écran. Pas de pagination : l'export
/// est borné par MAX_EXPORT_ROWS.
export async function getVolunteerExport(
  editionId: string,
  filter: Omit<VolunteerExportParams, "format" | "edition">,
  eventStartsAt: Date | null,
): Promise<ExportTable> {
  const records = await db.volunteer.findMany({
    where: buildVolunteerWhere(editionId, { ...filter, page: 1 }, eventStartsAt),
    orderBy: [{ user: { lastName: "asc" } }, { user: { firstName: "asc" } }],
    take: MAX_EXPORT_ROWS,
    select: {
      badgeNumber: true,
      planningStatus: true,
      photoPath: true,
      minorApprovedAt: true,
      user: { select: { firstName: true, lastName: true, email: true, phone: true, birthDate: true } },
      assignments: { select: { missionSlot: { select: { mission: { select: { name: true } } } } } },
    },
  });

  const rows = records.map((record) => {
    const isMinorPending =
      record.minorApprovedAt === null &&
      record.user.birthDate !== null &&
      eventStartsAt !== null &&
      isMinorOn(record.user.birthDate, eventStartsAt);
    const missionNames = [...new Set(record.assignments.map((assignment) => assignment.missionSlot.mission.name))];
    return [
      record.badgeNumber,
      record.user.lastName,
      record.user.firstName,
      record.user.email,
      record.user.phone,
      VOLUNTEER_STATUS_LABELS[deriveVolunteerStatus(record.planningStatus, record.assignments.length)],
      record.assignments.length,
      missionNames.join(", "),
      record.photoPath ? "Oui" : "Non",
      isMinorPending ? "Oui" : "Non",
    ];
  });

  return { sheetName: "Bénévoles", columns: VOLUNTEER_COLUMNS, rows };
}

const PLANNING_COLUMNS = [
  { header: "Jour", width: 14 },
  { header: "Horaire", width: 16 },
  { header: "Mission", width: 26 },
  { header: "Lieu", width: 18 },
  { header: "Badge", width: 14 },
  { header: "Nom", width: 20 },
  { header: "Prénom", width: 18 },
  { header: "Téléphone", width: 16 },
  { header: "Attribution", width: 14 },
] as const;

/// Une ligne par affectation, triée jour, créneau, mission puis nom : le
/// planning général, ou la liste d'une mission quand elle est filtrée.
export async function getPlanningExport(
  editionId: string,
  filter: Omit<PlanningExportParams, "format" | "edition">,
): Promise<ExportTable> {
  const assignments = await db.assignment.findMany({
    where: {
      volunteer: { editionId },
      missionSlot: {
        ...(filter.mission ? { missionId: filter.mission } : {}),
        ...(filter.jour ? { timeSlot: { eventDate: new Date(`${filter.jour}T00:00:00Z`) } } : {}),
      },
    },
    orderBy: [
      { missionSlot: { timeSlot: { startsAt: "asc" } } },
      { missionSlot: { mission: { position: "asc" } } },
      { volunteer: { user: { lastName: "asc" } } },
    ],
    take: MAX_EXPORT_ROWS,
    select: {
      source: true,
      volunteer: { select: { badgeNumber: true, user: { select: { firstName: true, lastName: true, phone: true } } } },
      missionSlot: {
        select: {
          mission: { select: { name: true, location: true } },
          timeSlot: { select: { eventDate: true, startsAt: true, endsAt: true } },
        },
      },
    },
  });

  const rows = assignments.map((assignment) => {
    const { mission, timeSlot } = assignment.missionSlot;
    return [
      formatEventDateShort(timeSlot.eventDate.toISOString().slice(0, 10)),
      formatTimeRange(timeSlot.startsAt, timeSlot.endsAt),
      mission.name,
      mission.location ?? "",
      assignment.volunteer.badgeNumber,
      assignment.volunteer.user.lastName,
      assignment.volunteer.user.firstName,
      assignment.volunteer.user.phone,
      assignment.source === "ADMIN" ? "Régie" : "Bénévole",
    ];
  });

  return { sheetName: "Planning", columns: PLANNING_COLUMNS, rows };
}
