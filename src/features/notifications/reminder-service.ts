import "server-only";

import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { DomainError } from "@/lib/errors";
import { isMailerConfigured, trySendMail, type MailMessage } from "@/lib/mailer";
import { AUDIT_ACTIONS } from "@/features/audit/constants";
import { REMINDER_CAMPAIGN_LABELS, type ReminderCampaign } from "@/features/notifications/constants";
import {
  listCampaignRecipients,
  listLockedSchedules,
  type CampaignRecipient,
} from "@/features/notifications/queries";
import {
  buildDraftPlanningReminder,
  buildEventReminder,
  buildMissingPhotoReminder,
} from "@/features/notifications/reminder-emails";

export type CampaignEdition = {
  id: string;
  name: string;
  registrationClosesAt: Date;
  contactEmail: string | null;
};

export type CampaignReport = { total: number; sent: number; failed: number };

type CampaignInput = {
  edition: CampaignEdition;
  campaign: ReminderCampaign;
  actorId: string;
};

type MessageBuilder = (recipient: CampaignRecipient) => MailMessage;

/// Prépare, pour une relance donnée, la fonction qui écrit le message de
/// chaque bénévole. Le rappel avant le Salon charge d'abord tous les plannings.
async function prepareBuilder(edition: CampaignEdition, campaign: ReminderCampaign): Promise<MessageBuilder> {
  const base = (recipient: CampaignRecipient) => ({
    to: recipient.email,
    firstName: recipient.firstName,
    editionName: edition.name,
    appUrl: env.NEXT_PUBLIC_APP_URL,
  });

  if (campaign === "draftPlanning") {
    return (recipient) => buildDraftPlanningReminder({ ...base(recipient), closesAt: edition.registrationClosesAt });
  }
  if (campaign === "missingPhoto") {
    return (recipient) => buildMissingPhotoReminder({ ...base(recipient), contactEmail: edition.contactEmail });
  }
  const schedules = await listLockedSchedules(edition.id);
  return (recipient) =>
    buildEventReminder({ ...base(recipient), schedule: schedules.get(recipient.volunteerId) ?? [] });
}

async function recordCampaign(input: CampaignInput, sent: number): Promise<void> {
  await db.auditLog.create({
    data: {
      editionId: input.edition.id,
      actorId: input.actorId,
      action: AUDIT_ACTIONS.volunteerReminderSent,
      entityType: "edition",
      entityId: input.edition.id,
      changes: { target: `${REMINDER_CAMPAIGN_LABELS[input.campaign]} (${sent} e-mail${sent > 1 ? "s" : ""})` },
    },
  });
}

/// Envoie une relance à tous les bénévoles concernés, un par un. Un échec
/// n'arrête pas la relance : la régie voit le décompte à la fin.
export async function sendReminderCampaign(input: CampaignInput): Promise<CampaignReport> {
  if (!isMailerConfigured()) {
    throw new DomainError("mail.unavailable", "L'envoi d'e-mails n'est pas configuré (variables SMTP).");
  }

  const recipients = await listCampaignRecipients(input.edition.id, input.campaign);
  const buildMessage = await prepareBuilder(input.edition, input.campaign);

  let sent = 0;
  for (const recipient of recipients) {
    const isSent = await trySendMail(buildMessage(recipient), {
      volunteerId: recipient.volunteerId,
      kind: input.campaign,
    });
    if (isSent) sent += 1;
  }

  if (sent > 0) await recordCampaign(input, sent);
  return { total: recipients.length, sent, failed: recipients.length - sent };
}
