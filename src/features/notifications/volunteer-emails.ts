import { buildAppLink, renderEmail, type EmailSection } from "@/lib/email-layout";
import { formatEventDateLong, formatTimeRange } from "@/lib/format";
import type { MailMessage } from "@/lib/mailer";

export type EmailScheduleEntry = {
  eventDate: string;
  startsAt: Date;
  endsAt: Date;
  missionName: string;
  missionLocation: string | null;
};

type VolunteerEmailBase = {
  to: string;
  firstName: string;
  editionName: string;
  appUrl: string;
};

type WelcomeEmailInput = VolunteerEmailBase & {
  eventDays: readonly string[];
  minSlots: number;
  maxSlots: number;
};

function pluralSlots(count: number): string {
  return `${count} créneau${count > 1 ? "x" : ""}`;
}

export function buildWelcomeEmail(input: WelcomeEmailInput): MailMessage {
  const days = input.eventDays.map((day) => formatEventDateLong(day));
  const { html, text } = renderEmail({
    greeting: `Bonjour ${input.firstName},`,
    paragraphs: [
      `Votre compte bénévole pour ${input.editionName} est créé. Merci de rejoindre la troupe !`,
      `Prochaine étape : choisir entre ${pluralSlots(input.minSlots)} et ${pluralSlots(input.maxSlots)} de 2 heures, puis valider votre planning.`,
    ],
    sections: days.length > 0 ? [{ heading: "Les dates du Salon", items: days }] : [],
    action: { label: "Composer mon planning", url: buildAppLink(input.appUrl, "/planning") },
  });
  return { to: input.to, subject: `Bienvenue dans la troupe · ${input.editionName}`, text, html };
}

/// Regroupe les créneaux par jour, dans l'ordre du planning.
export function groupScheduleByDay(schedule: readonly EmailScheduleEntry[]): EmailSection[] {
  const sections = new Map<string, string[]>();
  for (const entry of schedule) {
    const location = entry.missionLocation ? ` (${entry.missionLocation})` : "";
    const line = `${formatTimeRange(entry.startsAt, entry.endsAt)} · ${entry.missionName}${location}`;
    const items = sections.get(entry.eventDate) ?? [];
    sections.set(entry.eventDate, [...items, line]);
  }
  return [...sections.entries()].map(([day, items]) => ({ heading: formatEventDateLong(day), items }));
}

type PlanningConfirmationInput = VolunteerEmailBase & {
  schedule: readonly EmailScheduleEntry[];
};

export function buildPlanningConfirmationEmail(input: PlanningConfirmationInput): MailMessage {
  const { html, text } = renderEmail({
    greeting: `Bonjour ${input.firstName},`,
    paragraphs: [
      `Votre planning pour ${input.editionName} est validé. Le voici :`,
    ],
    sections: groupScheduleByDay(input.schedule),
    action: { label: "Voir mon récapitulatif", url: buildAppLink(input.appUrl, "/recapitulatif") },
    footnote: "Votre planning est désormais verrouillé. Pour toute modification, contactez l'équipe d'organisation.",
  });
  return { to: input.to, subject: `Votre planning est validé · ${input.editionName}`, text, html };
}
