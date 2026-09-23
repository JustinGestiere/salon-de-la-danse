import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PrintToolbar } from "@/components/admin/print-toolbar";
import { toQueryParams } from "@/lib/url";
import { formatDateTime } from "@/lib/format";
import { getActiveEdition, getEditionStart } from "@/features/editions/queries";
import { PrintTable } from "@/features/exports/components/print-table";
import { getVolunteerExport } from "@/features/exports/queries";
import { volunteerListFilterSchema } from "@/features/volunteers/admin-schemas";

export const metadata: Metadata = {
  title: "Fiches contact · Régie du Salon de la Danse",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/// Liste des contacts, filtrée comme la liste des bénévoles, prête à imprimer.
export default async function PrintContactsPage({ searchParams }: PageProps) {
  const edition = await getActiveEdition();
  if (!edition) notFound();

  const filter = volunteerListFilterSchema.omit({ page: true }).parse(toQueryParams(await searchParams));
  const eventStartsAt = await getEditionStart(edition.id);
  const table = await getVolunteerExport(edition.id, filter, eventStartsAt);
  const summary = `${table.rows.length} bénévole${table.rows.length > 1 ? "s" : ""}, ${edition.name}`;

  return (
    <>
      <PrintToolbar title="Fiches contact" summary={summary} />
      <main className="admin-print-list mx-auto flex max-w-[277mm] flex-col gap-4 p-6 text-ink print:max-w-none print:p-0">
        <header className="flex items-baseline justify-between border-b border-line-strong pb-3">
          <h1 className="font-display text-[24pt] leading-none">
            Fiches contact <em className="text-accent">{edition.name}</em>
          </h1>
          <span className="text-[8pt] text-muted">Édité le {formatDateTime(new Date())}</span>
        </header>
        <PrintTable table={table} />
      </main>
    </>
  );
}
