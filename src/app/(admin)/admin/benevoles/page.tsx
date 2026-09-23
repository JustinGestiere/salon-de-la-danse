import type { Metadata } from "next";

import { AdminAlert } from "@/components/admin/admin-alert";
import { AdminButtonLink, adminButtonClass } from "@/components/admin/admin-button";
import { EmptyState } from "@/components/admin/empty-state";
import { PageHeader } from "@/components/admin/page-header";
import { PaginationNav } from "@/components/admin/pagination-nav";
import { formatEventDateShort, formatTimeRange } from "@/lib/format";
import { buildQueryHref, toQueryParams } from "@/lib/url";
import { requireAdmin } from "@/features/admin/guards";
import { getActiveEdition, getEditionStart } from "@/features/editions/queries";
import { getEditionTimeline, listMissionOptions, listSensitiveSlots } from "@/features/planning/admin-queries";
import {
  getVolunteerDetail,
  getVolunteerStatusCounts,
  listVolunteers,
} from "@/features/volunteers/admin-queries";
import { volunteerListFilterSchema } from "@/features/volunteers/admin-schemas";
import { VolunteerDetail } from "@/features/volunteers/components/volunteer-detail";
import { VolunteerFilterBar } from "@/features/volunteers/components/volunteer-filter-bar";
import { VolunteerList } from "@/features/volunteers/components/volunteer-list";
import { isMinorOn } from "@/features/volunteers/status";

export const metadata: Metadata = {
  title: "Bénévoles · Régie du Salon de la Danse",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function VolunteersPage({ searchParams }: PageProps) {
  await requireAdmin();
  const edition = await getActiveEdition();
  if (!edition) return <AdminAlert tone="warning">Aucune édition active.</AdminAlert>;

  const params = toQueryParams(await searchParams);
  const filter = volunteerListFilterSchema.parse(params);
  const eventStart = await getEditionStart(edition.id);

  const [page, counts, missions, timeline, sensitiveSlots] = await Promise.all([
    listVolunteers(edition.id, filter, eventStart),
    getVolunteerStatusCounts(edition.id, eventStart),
    listMissionOptions(edition.id),
    getEditionTimeline(edition.id),
    listSensitiveSlots(edition.id),
  ]);

  const selectedId = params.benevole ?? page.rows[0]?.id ?? null;
  const volunteer = selectedId ? await getVolunteerDetail(edition.id, selectedId) : null;
  const rules = {
    minSlots: edition.minSlotsPerVolunteer,
    maxSlots: edition.maxSlotsPerVolunteer,
    maxConsecutive: edition.maxConsecutiveSlots,
  };
  const buildExportHref = (format: "csv" | "xlsx"): string =>
    buildQueryHref("/api/admin/exports/benevoles", params, { benevole: undefined, page: undefined, format });
  const selectionPatch = { benevole: undefined, page: undefined };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        kicker="La troupe"
        title="Bénévoles"
        description={`${counts.all} bénévoles inscrits pour ${edition.name}.`}
        actions={
          <>
            {/* Téléchargements de fichiers : un lien classique, pas une navigation next/link. */}
            <a href={buildExportHref("xlsx")} download className={adminButtonClass({ size: "sm" })}>
              Excel
            </a>
            <a href={buildExportHref("csv")} download className={adminButtonClass({ size: "sm" })}>
              CSV
            </a>
            <AdminButtonLink href={buildQueryHref("/admin/impression/contacts", params, selectionPatch)} size="sm" target="_blank">
              Fiches contact (PDF)
            </AdminButtonLink>
            <AdminButtonLink
              href={buildQueryHref("/admin/impression/badges", params, { ...selectionPatch, perimetre: "selection" })}
              size="sm"
              target="_blank"
            >
              Badges de la sélection
            </AdminButtonLink>
          </>
        }
      />

      <div className="grid items-start gap-8 lg:grid-cols-[520px_minmax(0,1fr)]">
        <section aria-label="Liste des bénévoles" className="flex flex-col gap-4">
          <VolunteerFilterBar
            counts={counts}
            missions={missions.map((mission) => ({ value: mission.id, label: mission.name }))}
            days={timeline.map((day) => ({ value: day.eventDate, label: formatEventDateShort(day.eventDate) }))}
          />
          <VolunteerList rows={page.rows} selectedId={volunteer?.id ?? null} params={params} maxSlots={rules.maxSlots} />
          <PaginationNav
            page={page.page}
            pageCount={page.pageCount}
            total={page.total}
            itemLabel="bénévoles"
            buildHref={(target) => buildQueryHref("/admin/benevoles", params, { page: String(target) })}
          />
        </section>

        <section aria-label="Fiche du bénévole" className="rounded-[28px] border border-line bg-surface p-6 sm:p-9 lg:sticky lg:top-24">
          {volunteer ? (
            <VolunteerDetail
              volunteer={volunteer}
              days={timeline}
              rules={rules}
              isMinorPending={
                volunteer.minorApprovedAt === null &&
                volunteer.birthDate !== null &&
                eventStart !== null &&
                isMinorOn(volunteer.birthDate, eventStart)
              }
              sensitiveSlots={sensitiveSlots.map((slot) => ({
                missionSlotId: slot.missionSlotId,
                label: `${slot.missionName} · ${formatEventDateShort(slot.eventDate)} · ${formatTimeRange(slot.startsAt, slot.endsAt)} (${slot.filled}/${slot.capacity})`,
              }))}
            />
          ) : (
            <EmptyState title="Aucune fiche ouverte.">Choisissez un bénévole dans la liste.</EmptyState>
          )}
        </section>
      </div>
    </div>
  );
}
