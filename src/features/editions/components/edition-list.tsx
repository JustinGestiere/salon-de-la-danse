import { adminButtonClass } from "@/components/admin/admin-button";
import { ConfirmActionButton } from "@/components/admin/confirm-action-button";
import { EmptyState } from "@/components/admin/empty-state";
import { StatusPill } from "@/components/admin/status-pill";
import { archiveEditionAction } from "@/features/editions/admin-actions";
import type { EditionSummary } from "@/features/editions/admin-queries";

const DAY_FORMAT = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

function describeDays(edition: EditionSummary): string {
  if (!edition.firstDay || !edition.lastDay) return "Grille de créneaux à créer";
  const first = DAY_FORMAT.format(new Date(edition.firstDay));
  const last = DAY_FORMAT.format(new Date(edition.lastDay));
  return first === last ? first : `Du ${first} au ${last}`;
}

type EditionListProps = {
  editions: readonly EditionSummary[];
  activeEditionId: string | null;
};

export function EditionList({ editions, activeEditionId }: EditionListProps) {
  if (editions.length === 0) {
    return <EmptyState title="Aucune édition pour l'instant.">Créez la première avec le formulaire.</EmptyState>;
  }

  return (
    <ul className="flex flex-col">
      {editions.map((edition) => {
        const isActive = edition.id === activeEditionId;
        return (
          <li key={edition.id} className="flex flex-wrap items-center justify-between gap-4 border-b border-line py-5">
            <div className="flex flex-col gap-1">
              <span className="flex flex-wrap items-center gap-3">
                <span className="font-display text-2xl text-ink">{edition.name}</span>
                {isActive ? <StatusPill tone="ok">En cours</StatusPill> : null}
                {edition.isArchived ? <StatusPill tone="neutral">Archivée</StatusPill> : null}
                {!isActive && !edition.isArchived ? <StatusPill tone="warn">En attente</StatusPill> : null}
              </span>
              <span className="text-sm text-muted">{describeDays(edition)}</span>
              <span className="text-xs text-subtle">
                {edition.volunteerCount} bénévole{edition.volunteerCount > 1 ? "s" : ""}, {edition.lockedCount} planning
                {edition.lockedCount > 1 ? "s" : ""} validé{edition.lockedCount > 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* Téléchargements de fichiers : des liens classiques, pas next/link. */}
              <a href={`/api/admin/exports/benevoles?format=xlsx&edition=${edition.id}`} download className={adminButtonClass({ size: "sm", variant: "ghost" })}>
                Bénévoles (Excel)
              </a>
              <a href={`/api/admin/exports/planning?format=xlsx&edition=${edition.id}`} download className={adminButtonClass({ size: "sm", variant: "ghost" })}>
                Planning (Excel)
              </a>
              {edition.isArchived ? null : (
                <ConfirmActionButton
                  label="Archiver"
                  confirmLabel="Confirmer l'archivage"
                  variant="secondary"
                  action={archiveEditionAction.bind(null, { editionId: edition.id })}
                />
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
