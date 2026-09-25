import { formatDayMonth } from "@/lib/format";
import { SALE_PHASES } from "@/features/tickets/content";
import { getPhaseLastDay, type SaleStatus } from "@/features/tickets/pricing";

type SalesCalendarNoticeProps = {
  /// Billetterie fermée : pas encore ouverte, entre deux phases, ou terminée.
  status: Exclude<SaleStatus, { kind: "open" }>;
};

/// Remplace le formulaire quand la vente en ligne est fermée.
export function SalesCalendarNotice({ status }: SalesCalendarNoticeProps) {
  if (status.kind === "ended") {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="font-display text-4xl text-ink">Vente en ligne terminée</h2>
        <p className="text-lg text-ink-soft">Les billets restent en vente au guichet du Salon, au tarif sur place.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-display text-4xl text-ink">
        Ouverture le <em className="text-accent">{formatDayMonth(new Date(status.nextPhase.startsAt))}</em>
      </h2>
      <ol className="flex flex-col border-t border-line-strong">
        {SALE_PHASES.map((phase) => (
          <li key={phase.id} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-line py-4">
            <span className="font-semibold text-ink">{phase.label}</span>
            <span className="text-muted">
              du {formatDayMonth(new Date(phase.startsAt))} au {formatDayMonth(getPhaseLastDay(phase))}
            </span>
          </li>
        ))}
      </ol>
      <p className="text-ink-soft">
        La vente privée est réservée aux licenciés FFDanse et aux écoles de danse, avec un code transmis par leur club
        ou leur école.
      </p>
    </div>
  );
}
