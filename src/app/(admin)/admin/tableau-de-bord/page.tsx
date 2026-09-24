import type { Metadata } from "next";

import { AdminAlert } from "@/components/admin/admin-alert";
import { CountdownHero } from "@/features/admin/components/countdown-hero";
import { TodoList, type TodoItem } from "@/features/admin/components/todo-list";
import { TroupeFunnel, type FunnelSegment } from "@/features/admin/components/troupe-funnel";
import { WeekendHeatmap } from "@/features/admin/components/weekend-heatmap";
import { requireAdmin } from "@/features/admin/guards";
import { getAdminOverview, type AdminOverview } from "@/features/admin/queries";
import { getActiveEdition, getEditionStart, isRegistrationOpen, type ActiveEdition } from "@/features/editions/queries";
import { ReminderPanel } from "@/features/notifications/components/reminder-panel";
import { countCampaignRecipients } from "@/features/notifications/queries";
import { computePublicFillRate, countGridAlerts, sumPublicSeats, type GridAlerts } from "@/features/planning/admin-grid";
import { getAdminGrid, type AdminGrid } from "@/features/planning/admin-queries";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = {
  title: "Vue d'ensemble · Régie du Salon de la Danse",
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function computeDaysLeft(start: Date | null, now: Date): number | null {
  if (!start) return null;
  return Math.max(0, Math.ceil((start.getTime() - now.getTime()) / MS_PER_DAY));
}

function describeRegistration(edition: ActiveEdition): string {
  if (edition.isRegistrationLocked) return "Inscriptions verrouillées manuellement : les plannings sont en consultation seule.";
  if (isRegistrationOpen(edition)) return `Inscriptions ouvertes jusqu'au ${formatDateTime(edition.registrationClosesAt)} · chiffres en temps réel`;
  return `Inscriptions fermées. Fenêtre : du ${formatDateTime(edition.registrationOpensAt)} au ${formatDateTime(edition.registrationClosesAt)}.`;
}

function buildFunnel(overview: AdminOverview): FunnelSegment[] {
  return [
    { key: "locked", label: "Planning validé", hint: "Verrouillé, prêt pour le badge", value: overview.lockedPlanningCount, href: "/admin/benevoles?statut=locked", barClassName: "bg-ok", valueClassName: "text-ok-ink" },
    { key: "draft", label: "En brouillon", hint: "À relancer", value: overview.draftWithSlotsCount, href: "/admin/benevoles?statut=draft", barClassName: "bg-warn", valueClassName: "text-warn-ink" },
    { key: "empty", label: "Compte, rien choisi", hint: "Aucun créneau", value: overview.emptyPlanningCount, href: "/admin/benevoles?statut=empty", barClassName: "bg-lilac", valueClassName: "text-lilac-ink" },
    { key: "invited", label: "Invité sans compte", hint: "Code encore valable", value: overview.invitationAvailableCount, href: "/admin/invitations?status=available", barClassName: "border-[1.5px] border-dashed border-subtle", valueClassName: "text-muted" },
  ];
}

function plural(count: number, singular: string, pluralForm: string): string {
  return `${count} ${count > 1 ? pluralForm : singular}`;
}

function buildTodos(overview: AdminOverview, alerts: GridAlerts, closesAt: Date): TodoItem[] {
  const items: (TodoItem & { count: number })[] = [
    { key: "sensitive", count: alerts.emptySensitiveSlots, isUrgent: true, title: `${plural(alerts.emptySensitiveSlots, "créneau sensible", "créneaux sensibles")} sans personne`, detail: "Billetterie et Caisse : attribution par la régie uniquement", href: "/admin/planning", cta: "Attribuer" },
    { key: "minors", count: overview.pendingMinorCount, isUrgent: true, title: `${plural(overview.pendingMinorCount, "profil mineur", "profils mineurs")} à valider`, detail: "Participation soumise à l'accord de la régie", href: "/admin/benevoles?statut=minor", cta: "Valider" },
    { key: "drafts", count: overview.draftWithSlotsCount, isUrgent: false, title: `${plural(overview.draftWithSlotsCount, "planning", "plannings")} en brouillon`, detail: `Non validés, fermeture le ${formatDateTime(closesAt)}`, href: "/admin/benevoles?statut=draft", cta: "Voir la liste" },
    { key: "full", count: alerts.fullPublicSlots, isUrgent: false, title: `${plural(alerts.fullPublicSlots, "créneau complet", "créneaux complets")}`, detail: "Une jauge à augmenter ?", href: "/admin/planning", cta: "Vérifier" },
    { key: "codes", count: overview.invitationAvailableCount, isUrgent: false, title: `${plural(overview.invitationAvailableCount, "code encore inutilisé", "codes encore inutilisés")}`, detail: "Invitations envoyées, aucun compte créé", href: "/admin/invitations?status=available", cta: "Voir" },
    { key: "photos", count: overview.missingPhotoCount, isUrgent: false, title: `${plural(overview.missingPhotoCount, "photo manquante", "photos manquantes")}`, detail: "Bloque l'impression du badge", href: "/admin/badges", cta: "Voir" },
  ];
  return items.filter((item) => item.count > 0);
}

function computeDayFillRates(grid: AdminGrid, sensitive: ReadonlySet<string>): Record<string, number> {
  const cells = Object.values(grid.cells);
  const rates: Record<string, number> = {};
  for (const day of grid.days) {
    const dayTimeSlots = new Set(day.timeSlots.map((timeSlot) => timeSlot.id));
    rates[day.eventDate] = computePublicFillRate(
      cells.filter((cell) => dayTimeSlots.has(cell.timeSlotId)),
      sensitive,
    );
  }
  return rates;
}

export default async function AdminOverviewPage() {
  await requireAdmin();
  const edition = await getActiveEdition();
  if (!edition) {
    return <AdminAlert tone="warning">Aucune édition active. Créez-en une depuis les réglages.</AdminAlert>;
  }

  const eventStart = await getEditionStart(edition.id);
  const [overview, grid, reminderCounts] = await Promise.all([
    getAdminOverview(edition.id, eventStart),
    getAdminGrid(edition.id),
    countCampaignRecipients(edition.id),
  ]);

  const sensitive = new Set(grid.missions.filter((mission) => !mission.isSelfBookable).map((mission) => mission.id));
  const cells = Object.values(grid.cells);
  const seats = sumPublicSeats(cells, sensitive);

  return (
    <div className="flex flex-col gap-12">
      <CountdownHero
        daysLeft={computeDaysLeft(eventStart, new Date())}
        startLabel={eventStart ? `Premier créneau le ${formatDateTime(eventStart)}` : null}
        lockedCount={overview.lockedPlanningCount}
        volunteerCount={overview.volunteerCount}
        filledSeats={seats.filled}
        totalSeats={seats.capacity}
        registrationLabel={describeRegistration(edition)}
      />
      <TroupeFunnel segments={buildFunnel(overview)} />
      <div className="grid items-start gap-12 xl:grid-cols-[minmax(0,1fr)_480px]">
        <WeekendHeatmap grid={grid} dayFillRates={computeDayFillRates(grid, sensitive)} />
        <div className="flex flex-col gap-12">
          <TodoList items={buildTodos(overview, countGridAlerts(cells, sensitive), edition.registrationClosesAt)} />
          <ReminderPanel recipientCounts={reminderCounts} />
        </div>
      </div>
    </div>
  );
}
