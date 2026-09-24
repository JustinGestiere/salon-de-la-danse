/// Relances envoyées à la main par la régie depuis la vue d'ensemble.
export const REMINDER_CAMPAIGNS = ["draftPlanning", "missingPhoto", "eventReminder"] as const;
export type ReminderCampaign = (typeof REMINDER_CAMPAIGNS)[number];

export const REMINDER_CAMPAIGN_LABELS: Record<ReminderCampaign, string> = {
  draftPlanning: "Plannings non validés",
  missingPhoto: "Photos manquantes",
  eventReminder: "Rappel avant le Salon",
};

export const REMINDER_CAMPAIGN_DESCRIPTIONS: Record<ReminderCampaign, string> = {
  draftPlanning: "Bénévoles dont le planning est encore en brouillon, vide ou non.",
  missingPhoto: "Bénévoles sans photo d'identité : leur badge ne peut pas être imprimé.",
  eventReminder: "Bénévoles au planning validé, avec le rappel de leurs créneaux.",
};
