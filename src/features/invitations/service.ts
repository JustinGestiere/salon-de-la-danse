import "server-only";

import { db } from "@/lib/db";
import { DomainError } from "@/lib/errors";
import {
  INVITATION_CODE_ALPHABET,
  INVITATION_CODE_LENGTH,
  INVITATION_CODE_PREFIX,
  MAX_CODE_GENERATION_ATTEMPTS,
} from "@/features/invitations/constants";

type GenerateInvitationCodesInput = {
  editionId: string;
  actorId: string;
  /// Une entrée par code à créer. `null` pour un code anonyme.
  recipients: readonly (string | null)[];
  expiresAt: Date | null;
};

function generateCode(): string {
  let suffix = "";
  for (let index = 0; index < INVITATION_CODE_LENGTH; index += 1) {
    const position = Math.floor(Math.random() * INVITATION_CODE_ALPHABET.length);
    suffix += INVITATION_CODE_ALPHABET[position];
  }
  return `${INVITATION_CODE_PREFIX}-${suffix}`;
}

/// Produit `count` codes dont aucun n'existe déjà en base. On écarte les
/// collisions avant l'insertion plutôt que de rattraper un P2002 code par code,
/// pour n'écrire le lot qu'une seule fois.
async function reserveUniqueCodes(count: number): Promise<string[]> {
  const codes = new Set<string>();

  for (
    let attempt = 0;
    attempt < MAX_CODE_GENERATION_ATTEMPTS && codes.size < count;
    attempt += 1
  ) {
    while (codes.size < count) codes.add(generateCode());

    const taken = await db.invitationCode.findMany({
      where: { code: { in: [...codes] } },
      select: { code: true },
    });
    for (const row of taken) codes.delete(row.code);
  }

  if (codes.size < count) {
    throw new DomainError(
      "invitation.generation",
      "Impossible de générer des codes uniques. Réessayez.",
    );
  }
  return [...codes];
}

export async function generateInvitationCodes(
  input: GenerateInvitationCodesInput,
): Promise<{ created: number }> {
  if (input.recipients.length === 0) {
    throw new DomainError("invitation.empty", "Aucun code à générer.");
  }

  const codes = await reserveUniqueCodes(input.recipients.length);
  const namedCount = input.recipients.filter((email) => email !== null).length;

  await db.$transaction([
    db.invitationCode.createMany({
      data: codes.map((code, index) => ({
        editionId: input.editionId,
        code,
        email: input.recipients[index] ?? null,
        expiresAt: input.expiresAt,
      })),
    }),
    db.auditLog.create({
      data: {
        editionId: input.editionId,
        actorId: input.actorId,
        action: "invitation.batchGenerated",
        entityType: "edition",
        entityId: input.editionId,
        changes: {
          count: codes.length,
          withEmail: namedCount,
          expiresAt: input.expiresAt?.toISOString() ?? null,
        },
      },
    }),
  ]);

  return { created: codes.length };
}

/// Supprime un code encore libre. Un code consommé reste en base : il est le
/// lien entre un bénévole et son invitation, et l'effacer casserait la piste
/// d'audit du recrutement.
export async function deleteUnusedInvitationCode(input: {
  invitationId: string;
  editionId: string;
  actorId: string;
}): Promise<void> {
  const invitation = await db.invitationCode.findFirst({
    where: { id: input.invitationId, editionId: input.editionId },
    select: { id: true, code: true, usedAt: true, usedByVolunteerId: true },
  });

  if (!invitation) {
    throw new DomainError("invitation.notFound", "Code introuvable.");
  }
  if (invitation.usedAt !== null || invitation.usedByVolunteerId !== null) {
    throw new DomainError(
      "invitation.used",
      "Un code déjà utilisé ne peut pas être supprimé.",
    );
  }

  await db.$transaction([
    db.invitationCode.delete({ where: { id: invitation.id } }),
    db.auditLog.create({
      data: {
        editionId: input.editionId,
        actorId: input.actorId,
        action: "invitation.deleted",
        entityType: "invitationCode",
        entityId: invitation.id,
        changes: { code: invitation.code },
      },
    }),
  ]);
}
