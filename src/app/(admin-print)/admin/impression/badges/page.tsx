import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdminAlert } from "@/components/admin/admin-alert";
import { PrintToolbar } from "@/components/admin/print-toolbar";
import { formatMonthYear } from "@/lib/format";
import { toQueryParams } from "@/lib/url";
import { BadgeSheet } from "@/features/badges/components/badge-sheet";
import { listBadgeHolders } from "@/features/badges/queries";
import { badgePrintParamsSchema } from "@/features/badges/schemas";
import { splitIntoSheets } from "@/features/badges/sheets";
import { getActiveEdition, getEditionStart } from "@/features/editions/queries";

export const metadata: Metadata = {
  title: "Badges · Régie du Salon de la Danse",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/// Planches de badges à l'échelle réelle. Sans photo, pas de badge : la photo
/// est obligatoire pour l'accréditation.
export default async function PrintBadgesPage({ searchParams }: PageProps) {
  const edition = await getActiveEdition();
  if (!edition) notFound();

  const params = badgePrintParamsSchema.parse(toQueryParams(await searchParams));
  const eventStartsAt = await getEditionStart(edition.id);
  const holders = await listBadgeHolders(edition.id, params, eventStartsAt);
  const printable = holders.filter((holder) => holder.hasPhoto);
  const excludedCount = holders.length - printable.length;
  const sheets = splitIntoSheets(printable);
  const summary = `${printable.length} badge${printable.length > 1 ? "s" : ""} sur ${sheets.length} page${sheets.length > 1 ? "s" : ""} A4`;

  return (
    <>
      <PrintToolbar title="Badges bénévoles" summary={summary} />
      <main className="flex flex-col items-center gap-8 bg-raised p-8 print:block print:bg-transparent print:p-0">
        {excludedCount > 0 ? (
          <div className="w-[210mm] print:hidden">
            <AdminAlert tone="warning">
              {excludedCount} badge{excludedCount > 1 ? "s" : ""} non imprimé{excludedCount > 1 ? "s" : ""} : photo manquante.
            </AdminAlert>
          </div>
        ) : null}
        {sheets.length === 0 ? (
          <div className="w-[210mm]">
            <AdminAlert tone="info">Aucun badge à imprimer pour cette sélection.</AdminAlert>
          </div>
        ) : null}
        {sheets.map((sheet, index) => (
          <BadgeSheet
            key={sheet[0]?.id ?? index}
            holders={sheet}
            eventLabel={eventStartsAt ? formatMonthYear(eventStartsAt) : edition.name}
            label={`Planche ${index + 1} sur ${sheets.length}`}
          />
        ))}
      </main>
    </>
  );
}
