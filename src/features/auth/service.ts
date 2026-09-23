import "server-only";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { DomainError } from "@/lib/errors";
import type { RegisterInput } from "@/features/auth/schemas";
import { storeVolunteerPhoto } from "@/features/auth/photo-storage";

const BADGE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const BADGE_SUFFIX_LENGTH = 5;
const BADGE_MAX_ATTEMPTS = 6;

type VerifiedInvitation = {
  id: string;
  editionId: string;
};

/// Un code d'invitation valide conditionne strictement l'inscription.
async function verifyInvitationCode(
  code: string,
  email: string,
): Promise<VerifiedInvitation> {
  const invitation = await db.invitationCode.findUnique({
    where: { code },
    select: {
      id: true,
      editionId: true,
      email: true,
      expiresAt: true,
      usedAt: true,
      usedByVolunteerId: true,
      edition: { select: { isArchived: true } },
    },
  });

  if (!invitation || invitation.edition.isArchived) {
    throw new DomainError("invitation.invalid", "Code d'invitation inconnu.");
  }
  if (invitation.usedAt || invitation.usedByVolunteerId) {
    throw new DomainError("invitation.used", "Ce code a déjà été utilisé.");
  }
  if (invitation.expiresAt && invitation.expiresAt < new Date()) {
    throw new DomainError("invitation.expired", "Ce code a expiré.");
  }
  if (invitation.email && invitation.email.toLowerCase() !== email) {
    throw new DomainError(
      "invitation.emailMismatch",
      "Ce code est réservé à une autre adresse e-mail.",
    );
  }

  return { id: invitation.id, editionId: invitation.editionId };
}

function generateBadgeSuffix(): string {
  let suffix = "";
  for (let index = 0; index < BADGE_SUFFIX_LENGTH; index += 1) {
    const position = Math.floor(Math.random() * BADGE_ALPHABET.length);
    suffix += BADGE_ALPHABET[position];
  }
  return suffix;
}

/// Crée le compte via Better Auth (qui gère le hash et la session), puis
/// renseigne les champs métier absents du formulaire d'auth.
async function createUserAccount(input: RegisterInput): Promise<string> {
  const { user } = await auth.api.signUpEmail({
    body: {
      email: input.email,
      password: input.password,
      name: `${input.firstName} ${input.lastName}`,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
    },
    headers: await headers(),
  });

  if (input.birthDate) {
    await db.user.update({
      where: { id: user.id },
      data: { birthDate: new Date(input.birthDate) },
    });
  }

  return user.id;
}

/// Crée la participation et consomme le code, de façon atomique. La contrainte
/// d'unicité sur le code garantit qu'il ne sert qu'une fois.
async function provisionVolunteer(
  userId: string,
  editionId: string,
  invitationId: string,
): Promise<string> {
  for (let attempt = 0; attempt < BADGE_MAX_ATTEMPTS; attempt += 1) {
    const badgeNumber = `BEN-${generateBadgeSuffix()}`;
    try {
      const volunteer = await db.$transaction(async (tx) => {
        const created = await tx.volunteer.create({
          data: { userId, editionId, badgeNumber },
          select: { id: true },
        });
        await tx.invitationCode.update({
          where: { id: invitationId, usedAt: null },
          data: { usedAt: new Date(), usedByVolunteerId: created.id },
        });
        await tx.auditLog.create({
          data: {
            editionId,
            actorId: userId,
            action: "consent.accepted",
            entityType: "user",
            entityId: userId,
            changes: { terms: true, privacy: true, acceptedAt: new Date().toISOString() },
          },
        });
        return created;
      });
      return volunteer.id;
    } catch (error) {
      if (isUniqueBadgeCollision(error) && attempt < BADGE_MAX_ATTEMPTS - 1) {
        continue;
      }
      throw error;
    }
  }
  throw new DomainError("volunteer.badge", "Impossible de générer un badge unique.");
}

function isUniqueBadgeCollision(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

/// Annule une inscription interrompue : libère le code d'invitation s'il a
/// été consommé par cette inscription, puis supprime le compte (participation
/// et sessions partent en cascade).
async function rollbackRegistration(userId: string, invitationId: string): Promise<void> {
  await db.$transaction([
    db.invitationCode.updateMany({
      where: { id: invitationId, usedByVolunteer: { userId } },
      data: { usedAt: null, usedByVolunteerId: null },
    }),
    db.user.deleteMany({ where: { id: userId } }),
  ]);
}

/// Point d'entrée métier de l'inscription bénévole.
export async function registerVolunteer(
  input: RegisterInput,
  photo: File,
): Promise<{ volunteerId: string }> {
  const invitation = await verifyInvitationCode(input.invitationCode, input.email);

  const userId = await createUserAccount(input);

  try {
    const volunteerId = await provisionVolunteer(userId, invitation.editionId, invitation.id);
    const photoPath = await storeVolunteerPhoto(volunteerId, photo);
    await db.volunteer.update({
      where: { id: volunteerId },
      data: { photoPath },
    });
    return { volunteerId };
  } catch (error) {
    // Le compte a été créé mais l'inscription a échoué : on l'annule pour ne
    // pas laisser un utilisateur orphelin (qui bloquerait l'unicité e-mail) ni
    // un code d'invitation consommé pour rien. L'erreur d'origine reste celle
    // renvoyée ; un échec de l'annulation est loggé avec son contexte.
    await rollbackRegistration(userId, invitation.id).catch((rollbackError: unknown) => {
      console.error(
        "[registerVolunteer] échec de l'annulation de l'inscription",
        { userId, invitationId: invitation.id },
        rollbackError,
      );
    });
    throw error;
  }
}
