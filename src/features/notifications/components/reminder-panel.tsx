import { FluentIcon } from "@/components/ui/fluent-icon";
import {
  REMINDER_CAMPAIGN_DESCRIPTIONS,
  REMINDER_CAMPAIGN_LABELS,
  REMINDER_CAMPAIGNS,
  type ReminderCampaign,
} from "@/features/notifications/constants";
import { ReminderCampaignButton } from "@/features/notifications/components/reminder-campaign-button";

type ReminderPanelProps = {
  recipientCounts: Record<ReminderCampaign, number>;
};

/// Relances e-mail de la régie, envoyées à la main.
export function ReminderPanel({ recipientCounts }: ReminderPanelProps) {
  return (
    <section aria-labelledby="reminders-title" className="flex flex-col gap-4">
      <h2 id="reminders-title" className="flex items-center gap-3 font-display text-3xl text-ink">
        <FluentIcon name="mail" className="size-7" />
        <span>
          Relances <em className="text-muted">par e-mail</em>
        </span>
      </h2>
      <ul className="flex flex-col">
        {REMINDER_CAMPAIGNS.map((campaign) => (
          <li key={campaign} className="flex flex-wrap items-center gap-4 border-b border-line py-4">
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="text-[15px] font-semibold text-ink">
                {REMINDER_CAMPAIGN_LABELS[campaign]}{" "}
                <span className="font-normal text-muted">· {recipientCounts[campaign]} bénévole{recipientCounts[campaign] > 1 ? "s" : ""}</span>
              </p>
              <p className="text-sm text-subtle">{REMINDER_CAMPAIGN_DESCRIPTIONS[campaign]}</p>
            </div>
            <ReminderCampaignButton campaign={campaign} recipientCount={recipientCounts[campaign]} />
          </li>
        ))}
      </ul>
    </section>
  );
}
