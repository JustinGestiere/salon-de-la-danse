"use client";

import { useState, useTransition } from "react";

import { AdminButton } from "@/components/admin/admin-button";
import { sendReminderCampaignAction } from "@/features/notifications/actions";
import type { ReminderCampaign } from "@/features/notifications/constants";
import type { CampaignReport } from "@/features/notifications/reminder-service";

type ReminderCampaignButtonProps = {
  campaign: ReminderCampaign;
  recipientCount: number;
};

function describeReport({ sent, failed }: CampaignReport): string {
  const delivered = `${sent} e-mail${sent > 1 ? "s" : ""} envoyé${sent > 1 ? "s" : ""}`;
  return failed > 0 ? `${delivered}, ${failed} en échec.` : `${delivered}.`;
}

/// Envoi confirmé en deux temps : une relance part vers de nombreux bénévoles
/// et ne se rattrape pas.
export function ReminderCampaignButton({ campaign, recipientCount }: ReminderCampaignButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function send(): void {
    setMessage(null);
    startTransition(async () => {
      const result = await sendReminderCampaignAction({ campaign });
      setIsConfirming(false);
      setMessage(
        result.ok
          ? { tone: "ok", text: describeReport(result.data) }
          : { tone: "error", text: result.error.message },
      );
    });
  }

  const feedback = message ? (
    <span role={message.tone === "error" ? "alert" : "status"} className={`text-xs ${message.tone === "error" ? "text-danger-ink" : "text-ok-ink"}`}>
      {message.text}
    </span>
  ) : null;

  if (!isConfirming) {
    return (
      <span className="inline-flex flex-col items-end gap-1">
        <AdminButton size="sm" onClick={() => setIsConfirming(true)} disabled={recipientCount === 0}>
          Envoyer
        </AdminButton>
        {feedback}
      </span>
    );
  }

  return (
    <span className="inline-flex flex-wrap items-center justify-end gap-2">
      <AdminButton size="sm" variant="primary" onClick={send} isLoading={isPending}>
        {`Envoyer à ${recipientCount} bénévole${recipientCount > 1 ? "s" : ""}`}
      </AdminButton>
      <AdminButton size="sm" variant="ghost" onClick={() => setIsConfirming(false)} disabled={isPending}>
        Annuler
      </AdminButton>
    </span>
  );
}
