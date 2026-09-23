import type { Metadata } from "next";

import { AdminAlert } from "@/components/admin/admin-alert";
import { EmptyState } from "@/components/admin/empty-state";
import { PageHeader } from "@/components/admin/page-header";
import { adminButtonClass, AdminButtonLink } from "@/components/admin/admin-button";
import { buildQueryHref, toQueryParams } from "@/lib/url";
import { requireAdmin } from "@/features/admin/guards";
import { getActiveEdition } from "@/features/editions/queries";
import { computePublicFillRate } from "@/features/planning/admin-grid";
import {
  getAdminGrid,
  getMissionSlotDetail,
  searchAssignableVolunteers,
} from "@/features/planning/admin-queries";
import { adminPlanningParamsSchema } from "@/features/planning/admin-schemas";
import { AdminPlanningGrid } from "@/features/planning/components/admin-planning-grid";
import { DayTabs } from "@/features/planning/components/day-tabs";
import { SlotDetailPanel } from "@/features/planning/components/slot-detail-panel";

export const metadata: Metadata = {
  title: "Planning · Régie du Salon de la Danse",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const LEGEND = [
  { label: "Places disponibles", className: "border-ok/50 bg-ok-soft" },
  { label: "Presque complet", className: "border-warn/60 bg-warn-soft" },
  { label: "Complet", className: "border-danger/60 bg-danger-soft" },
  { label: "Poste sensible (régie)", className: "border-dashed border-lilac" },
] as const;

export default async function AdminPlanningPage({ searchParams }: PageProps) {
  await requireAdmin();
  const edition = await getActiveEdition();
  if (!edition) return <AdminAlert tone="warning">Aucune édition active.</AdminAlert>;

  const params = toQueryParams(await searchParams);
  const query = adminPlanningParamsSchema.parse(params);
  const grid = await getAdminGrid(edition.id);

  if (grid.days.length === 0) {
    return (
      <div className="flex flex-col gap-8">
        <PageHeader kicker="Le conducteur" title="Planning" />
        <EmptyState title="La grille n'est pas encore créée.">
          Ajoutez des missions depuis les réglages une fois les créneaux de l'édition en place.
        </EmptyState>
      </div>
    );
  }

  const day = grid.days.find((candidate) => candidate.eventDate === query.jour) ?? grid.days[0];
  if (!day) return null;

  const sensitive = new Set(grid.missions.filter((mission) => !mission.isSelfBookable).map((mission) => mission.id));
  const cells = Object.values(grid.cells);
  const dayTabs = grid.days.map((candidate) => {
    const timeSlotIds = new Set(candidate.timeSlots.map((timeSlot) => timeSlot.id));
    return {
      eventDate: candidate.eventDate,
      fillRate: computePublicFillRate(cells.filter((cell) => timeSlotIds.has(cell.timeSlotId)), sensitive),
    };
  });

  const slot = query.case ? await getMissionSlotDetail(edition.id, query.case) : null;
  const candidates =
    slot && query.recherche
      ? await searchAssignableVolunteers({ editionId: edition.id, timeSlotId: slot.timeSlotId, query: query.recherche })
      : null;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        kicker="Le conducteur"
        title="Planning"
        actions={
          <>
            <a href={buildQueryHref("/api/admin/exports/planning", {}, { format: "xlsx" })} download className={adminButtonClass({ size: "sm" })}>
              Excel
            </a>
            <a href={buildQueryHref("/api/admin/exports/planning", {}, { format: "csv" })} download className={adminButtonClass({ size: "sm" })}>
              CSV
            </a>
            <AdminButtonLink href={`/admin/impression/missions?jour=${day.eventDate}`} size="sm" target="_blank">
              Listes par mission (PDF)
            </AdminButtonLink>
          </>
        }
      />
      <DayTabs days={dayTabs} activeDay={day.eventDate} params={params} />

      <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="flex min-w-0 flex-col gap-5">
          <AdminPlanningGrid grid={grid} day={day} selectedSlotId={slot?.id ?? null} params={params} />
          <ul className="flex flex-wrap gap-x-5 gap-y-2 pl-0 text-xs text-muted xl:pl-[204px]">
            {LEGEND.map((item) => (
              <li key={item.label} className="flex items-center gap-2">
                <span aria-hidden="true" className={`size-3 rounded border ${item.className}`} />
                {item.label}
              </li>
            ))}
          </ul>
        </div>

        <aside aria-label="Détail du créneau" className="rounded-[28px] border border-line bg-surface p-7 xl:sticky xl:top-24">
          {slot ? (
            <SlotDetailPanel slot={slot} searchQuery={query.recherche ?? ""} candidates={candidates} />
          ) : (
            <EmptyState title="Choisissez une case.">
              Cliquez sur un créneau de la grille pour voir les inscrits, ajuster la jauge ou affecter quelqu'un.
            </EmptyState>
          )}
        </aside>
      </div>
    </div>
  );
}
