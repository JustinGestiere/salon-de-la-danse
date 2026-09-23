import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EmptyState } from "@/components/admin/empty-state";
import { PrintToolbar } from "@/components/admin/print-toolbar";
import { formatEventDateLong } from "@/lib/format";
import { toQueryParams } from "@/lib/url";
import { getActiveEdition } from "@/features/editions/queries";
import { MissionRosterSheet } from "@/features/exports/components/mission-roster-sheet";
import { getMissionRosters } from "@/features/exports/roster-queries";
import { planningExportParamsSchema } from "@/features/exports/schemas";

export const metadata: Metadata = {
  title: "Listes par mission · Régie du Salon de la Danse",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/// Planning imprimable, une mission par page : tout le week-end ou un seul jour.
export default async function PrintMissionRostersPage({ searchParams }: PageProps) {
  const edition = await getActiveEdition();
  if (!edition) notFound();

  const filter = planningExportParamsSchema.omit({ format: true, edition: true }).parse(toQueryParams(await searchParams));
  const rosters = await getMissionRosters(edition.id, filter);
  const period = filter.jour ? formatEventDateLong(filter.jour) : "Tout le week-end";

  return (
    <>
      <PrintToolbar title="Listes par mission" summary={`${period}, ${rosters.length} mission${rosters.length > 1 ? "s" : ""}`} />
      <main className="admin-print-document mx-auto flex max-w-[190mm] flex-col p-6 text-ink print:max-w-none print:p-0">
        <p className="text-[9pt] uppercase tracking-[0.2em] text-muted first-letter:uppercase">
          {edition.name} · {period}
        </p>
        {rosters.length === 0 ? <EmptyState title="Aucune mission pour cette période." /> : null}
        {rosters.map((roster) => (
          <MissionRosterSheet key={roster.missionId} roster={roster} />
        ))}
      </main>
    </>
  );
}
