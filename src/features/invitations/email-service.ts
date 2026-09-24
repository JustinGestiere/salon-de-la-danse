import "server-only";

import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { DomainError } from "@/lib/errors";
import { isMailerConfigured, trySendMail } from "@/lib/mailer";
import { AUDIT_ACTIONS } from "@/features/audit/constants";
import { buildInvitationEmail } from "@/features/invitations/invitation-email";

export type InvitationToSend = {
  id: string;
  code: string;
  email: string;
  expiresAt: Date | null;
};

export type InvitationSendReport = { sent: number; failed: number };

type SendInvitationsInput = {
  editionId: string;
  editionName: string;
  actorId: string;
  invitations: readonly InvitationToSend[];
};

async function deliverInvitation(invitation: InvitationToSend, editionName: string): Promise<boolean> {
  const message = buildInvitationEmail({
    to: invitation.email,
    appUrl: env.NEXT_PUBLIC_APP_URL,
    code: invitation.code,
    editionName,
    expiresAt: invitation.expiresAt,
  });
  return trySendMail(message, { invitationId: invitation.id });
}

/// Envoie les codes nominatifs un par un et date ceux qui sont partis. Un échec
/// n'arrête pas le lot : la régie voit le décompte et peut renvoyer ensuite.
export async function sendInvitationEmails(input: SendInvitationsInput): Promise<InvitationSendReport> {
  if (input.invitations.length === 0) return { sent: 0, failed: 0 };
  if (!isMailerConfigured()) return { sent: 0, failed: input.invitations.length };

  const sentIds: string[] = [];
  for (const invitation of input.invitations) {
    if (await deliverInvitation(invitation, input.editionName)) sentIds.push(invitation.id);
  }

  if (sentIds.length > 0) {
    await db.$transaction([
      db.invitationCode.updateMany({ where: { id: { in: sentIds } }, data: { sentAt: new Date() } }),
      db.auditLog.create({
        data: {
          editionId: input.editionId,
          actorId: input.actorId,
          action: AUDIT_ACTIONS.invitationSent,
          entityType: "edition",
          entityId: input.editionId,
          changes: { count: sentIds.length },
        },
      }),
    ]);
  }

  return { sent: sentIds.length, failed: input.invitations.length - sentIds.length };
}

type ResendInvitationInput = {
  invitationId: string;
  editionId: string;
  editionName: string;
  actorId: string;
};

async function findSendableInvitation(invitationId: string, editionId: string): Promise<InvitationToSend> {
  const invitation = await db.invitationCode.findFirst({
    where: { id: invitationId, editionId },
    select: { id: true, code: true, email: true, expiresAt: true, usedAt: true },
  });

  if (!invitation) throw new DomainError("invitation.notFound", "Code introuvable.");
  if (!invitation.email) throw new DomainError("invitation.anonymous", "Ce code n'a pas d'adresse e-mail.");
  if (invitation.usedAt) throw new DomainError("invitation.used", "Ce code a déjà servi à créer un compte.");
  if (invitation.expiresAt && invitation.expiresAt <= new Date()) {
    throw new DomainError("invitation.expired", "Ce code a expiré.");
  }
  return { id: invitation.id, code: invitation.code, email: invitation.email, expiresAt: invitation.expiresAt };
}

/// Renvoi manuel d'un code par la régie. Ici l'échec remonte : l'admin a
/// demandé cet envoi précis et doit savoir qu'il n'est pas parti.
export async function resendInvitationEmail(input: ResendInvitationInput): Promise<void> {
  const invitation = await findSendableInvitation(input.invitationId, input.editionId);
  if (!isMailerConfigured()) {
    throw new DomainError("mail.unavailable", "L'envoi d'e-mails n'est pas configuré (variables SMTP).");
  }
  if (!(await deliverInvitation(invitation, input.editionName))) {
    throw new DomainError("mail.failed", "L'e-mail n'a pas pu partir. Réessayez dans un instant.");
  }

  await db.$transaction([
    db.invitationCode.update({ where: { id: invitation.id }, data: { sentAt: new Date() } }),
    db.auditLog.create({
      data: {
        editionId: input.editionId,
        actorId: input.actorId,
        action: AUDIT_ACTIONS.invitationSent,
        entityType: "invitationCode",
        entityId: invitation.id,
        changes: { code: invitation.code },
      },
    }),
  ]);
}
