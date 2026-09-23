import "server-only";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { DomainError } from "@/lib/errors";
import { isUniqueConstraintError } from "@/lib/prisma-errors";
import { AUDIT_ACTIONS } from "@/features/audit/constants";
import { buildAuditLogData } from "@/features/audit/entries";
import type { UpdateVolunteerProfileInput } from "@/features/volunteers/admin-schemas";
import { generateTemporaryPassword } from "@/features/volunteers/temporary-password";

export type AdminActor = {
  editionId: string;
  actorId: string;
};

async function loadVolunteer(editionId: string, volunteerId: string) {
  const volunteer = await db.volunteer.findFirst({
    where: { id: volunteerId, editionId },
    select: {
      id: true,
      planningStatus: true,
      minorApprovedAt: true,
      user: {
        select: { id: true, firstName: true, lastName: true, email: true, phone: true, birthDate: true },
      },
    },
  });
  if (!volunteer) throw new DomainError("volunteer.notFound", "Bénévole introuvable.");
  return volunteer;
}

function fullName(user: { firstName: string; lastName: string }): string {
  return `${user.firstName} ${user.lastName}`;
}

function toIsoDateOrNull(value: Date | null): string | null {
  return value ? value.toISOString().slice(0, 10) : null;
}

/// Champs de la fiche comparés avant écriture, pour ne tracer que les changements.
const PROFILE_FIELDS = ["firstName", "lastName", "email", "phone", "birthDate"] as const;

/// Correction des informations personnelles, verrouillées côté bénévole une fois
/// validées : seule la régie peut les modifier. Seuls les champs changés sont
/// écrits au journal.
export async function updateVolunteerProfile(
  actor: AdminActor,
  input: UpdateVolunteerProfileInput,
): Promise<void> {
  const volunteer = await loadVolunteer(actor.editionId, input.volunteerId);
  const current = {
    firstName: volunteer.user.firstName,
    lastName: volunteer.user.lastName,
    email: volunteer.user.email,
    phone: volunteer.user.phone,
    birthDate: toIsoDateOrNull(volunteer.user.birthDate),
  };
  const next = {
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phone: input.phone,
    birthDate: input.birthDate === "" ? null : input.birthDate,
  };

  const changedFields = PROFILE_FIELDS.filter((field) => current[field] !== next[field]);
  if (changedFields.length === 0) return;

  const before = Object.fromEntries(changedFields.map((field) => [field, current[field]]));
  const after = Object.fromEntries(changedFields.map((field) => [field, next[field]]));

  try {
    await db.$transaction([
      db.user.update({
        where: { id: volunteer.user.id },
        data: {
          ...next,
          name: fullName(next),
          birthDate: next.birthDate ? new Date(`${next.birthDate}T00:00:00Z`) : null,
        },
      }),
      db.auditLog.create({
        data: buildAuditLogData({
          ...actor,
          action: AUDIT_ACTIONS.volunteerProfileUpdated,
          entityType: "volunteer",
          entityId: volunteer.id,
          changes: { target: fullName(next), before, after },
        }),
      }),
    ]);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new DomainError("volunteer.emailTaken", "Cette adresse e-mail est déjà utilisée par un autre compte.");
    }
    throw error;
  }
}

/// Outrepassement admin : rouvre un planning validé (ou le reverrouille). Le
/// contenu du planning n'est pas touché.
export async function setPlanningLock(
  actor: AdminActor,
  volunteerId: string,
  isLocked: boolean,
): Promise<void> {
  const volunteer = await loadVolunteer(actor.editionId, volunteerId);
  const targetStatus = isLocked ? "LOCKED" : "DRAFT";
  if (volunteer.planningStatus === targetStatus) {
    throw new DomainError(
      "volunteer.lockUnchanged",
      isLocked ? "Ce planning est déjà validé." : "Ce planning est déjà modifiable.",
    );
  }

  await db.$transaction([
    db.volunteer.update({
      where: { id: volunteer.id },
      data: { planningStatus: targetStatus, lockedAt: isLocked ? new Date() : null },
    }),
    db.auditLog.create({
      data: buildAuditLogData({
        ...actor,
        action: isLocked ? AUDIT_ACTIONS.volunteerPlanningLocked : AUDIT_ACTIONS.volunteerPlanningUnlocked,
        entityType: "volunteer",
        entityId: volunteer.id,
        changes: {
          target: fullName(volunteer.user),
          before: { planningStatus: volunteer.planningStatus },
          after: { planningStatus: targetStatus },
        },
      }),
    }),
  ]);
}

export async function approveMinorParticipation(actor: AdminActor, volunteerId: string): Promise<void> {
  const volunteer = await loadVolunteer(actor.editionId, volunteerId);
  if (volunteer.minorApprovedAt) {
    throw new DomainError("volunteer.minorAlreadyApproved", "Cette participation est déjà validée.");
  }

  await db.$transaction([
    db.volunteer.update({ where: { id: volunteer.id }, data: { minorApprovedAt: new Date() } }),
    db.auditLog.create({
      data: buildAuditLogData({
        ...actor,
        action: AUDIT_ACTIONS.volunteerMinorApproved,
        entityType: "volunteer",
        entityId: volunteer.id,
        changes: { target: fullName(volunteer.user) },
      }),
    }),
  ]);
}

/// Remplace le mot de passe par un mot de passe provisoire, via le plugin admin
/// de Better Auth (hachage et stockage restent à la librairie), puis ferme les
/// sessions ouvertes. Le mot de passe n'est renvoyé qu'une fois et jamais
/// écrit au journal.
export async function resetVolunteerPassword(
  actor: AdminActor,
  volunteerId: string,
  requestHeaders: Headers,
): Promise<{ temporaryPassword: string }> {
  const volunteer = await loadVolunteer(actor.editionId, volunteerId);
  const temporaryPassword = generateTemporaryPassword();

  await auth.api.setUserPassword({
    body: { userId: volunteer.user.id, newPassword: temporaryPassword },
    headers: requestHeaders,
  });
  await auth.api.revokeUserSessions({ body: { userId: volunteer.user.id }, headers: requestHeaders });

  await db.auditLog.create({
    data: buildAuditLogData({
      ...actor,
      action: AUDIT_ACTIONS.volunteerPasswordReset,
      entityType: "volunteer",
      entityId: volunteer.id,
      changes: { target: fullName(volunteer.user) },
    }),
  });

  return { temporaryPassword };
}
