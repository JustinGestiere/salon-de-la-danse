import type { Metadata } from "next";

import { AdminAlert } from "@/components/admin/admin-alert";
import { AdminButtonLink } from "@/components/admin/admin-button";
import { EmptyState } from "@/components/admin/empty-state";
import { formatMonthYear } from "@/lib/format";
import { toQueryParams } from "@/lib/url";
import { requireAdmin } from "@/features/admin/guards";
import { BadgeScopePicker } from "@/features/badges/components/badge-scope-picker";
import { BadgeSheet } from "@/features/badges/components/badge-sheet";
import { MissingPhotoList } from "@/features/badges/components/missing-photo-list";
import { getBadgeScopeCounts, listBadgeHolders } from "@/features/badges/queries";
import { badgePageParamsSchema } from "@/features/badges/schemas";
import { BADGES_PER_SHEET, splitIntoSheets } from "@/features/badges/sheets";
import { getActiveEdition, getEditionStart } from "@/features/editions/queries";

export const metadata: Metadata = {
  title: "Badges · Régie du Salon de la Danse",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminBadgesPage({ searchParams }: PageProps) {
  await requireAdmin();
  const edition = await getActiveEdition();
  if (!edition) return <AdminAlert tone="warning">Aucune édition active.</AdminAlert>;

  const { perimetre } = badgePageParamsSchema.parse(toQueryParams(await searchParams));
  const isSelection = perimetre === "selection";
  const eventStartsAt = await getEditionStart(edition.id);
  const [counts, holders] = await Promise.all([
    getBadgeScopeCounts(edition.id),
    isSelection ? Promise.resolve([]) : listBadgeHolders(edition.id, { perimetre }, eventStartsAt),
  ]);
  const printable = holders.filter((holder) => holder.hasPhoto);
  const sheetCount = splitIntoSheets(printable).length;
  const preview = printable.slice(0, BADGES_PER_SHEET);

  return (
    <div className="grid gap-10 xl:grid-cols-[320px_minmax(0,1fr)]">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-subtle">L'accréditation</p>
          <h1 className="font-display text-5xl leading-none text-ink">Badges</h1>
        </div>
        <BadgeScopePicker activeScope={perimetre} counts={counts} />
        <MissingPhotoList holders={holders.filter((holder) => !holder.hasPhoto)} />
        {isSelection ? (
          <AdminButtonLink href="/admin/benevoles" variant="primary">
            Filtrer la liste des bénévoles
          </AdminButtonLink>
        ) : (
          <div className="flex flex-col gap-2">
            <AdminButtonLink href={`/admin/impression/badges?perimetre=${perimetre}`} target="_blank" variant="primary">
              Imprimer · {sheetCount} page{sheetCount > 1 ? "s" : ""}
            </AdminButtonLink>
            <span className="text-center text-xs text-subtle">A4, 8 badges par page (105 × 74 mm)</span>
          </div>
        )}
      </div>
      <section aria-labelledby="preview-title" className="flex min-w-0 flex-col gap-4">
        <h2 id="preview-title" className="font-display text-2xl text-ink">
          Aperçu <em className="text-muted">de la première planche</em>
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted">
          Au scan du QR code, l'accueil ouvre la fiche de vérification du bénévole : nom, photo, statut du planning et
          missions du jour. La page est réservée à la régie connectée.
        </p>
        {preview.length === 0 ? (
          <EmptyState title="Rien à prévisualiser.">
            {isSelection
              ? "Sur la liste des bénévoles, filtrez puis choisissez « Badges de la sélection »."
              : "Aucun bénévole avec photo dans ce périmètre."}
          </EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <div className="w-fit [zoom:0.62]">
              <BadgeSheet holders={preview} eventLabel={eventStartsAt ? formatMonthYear(eventStartsAt) : edition.name} label="Aperçu de la première planche" />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
