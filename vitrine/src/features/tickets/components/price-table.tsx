import { formatDayMonth, formatEuros } from "@/lib/format";
import { SALE_PHASES, TICKET_TYPES, type PriceTier } from "@/features/tickets/content";
import { getOnSitePriceInCents, getPhaseLastDay } from "@/features/tickets/pricing";

type PriceTablePhase = PriceTier | "onSite";

type PriceTableProps = {
  /// Colonne mise en avant (tarif en vigueur), ou null hors période de vente.
  currentPhase: PriceTablePhase | null;
};

/// Dates de vente d'un tarif, tirées du calendrier (vente privée comprise).
function describeTierDates(priceTier: PriceTier): string {
  return SALE_PHASES.filter((phase) => phase.priceTier === priceTier)
    .map((phase) => `${formatDayMonth(new Date(phase.startsAt))} au ${formatDayMonth(getPhaseLastDay(phase))}`)
    .join(", ");
}

const COLUMNS: readonly { id: PriceTablePhase; label: string; hint: string }[] = [
  { id: "earlyBird", label: "Early Bird", hint: describeTierDates("earlyBird") },
  { id: "fullPrice", label: "Plein tarif", hint: describeTierDates("fullPrice") },
  { id: "onSite", label: "Guichet", hint: "Sur place, pendant le Salon" },
];

/// Grille complète des tarifs, colonne en vigueur mise en avant.
export function PriceTable({ currentPhase }: PriceTableProps) {
  return (
    <div className="overflow-x-auto rounded-[28px] border border-line">
      <table className="w-full min-w-[640px] border-collapse text-left">
        <caption className="sr-only">Tarifs selon la date d'achat</caption>
        <thead>
          <tr className="border-b border-line-strong text-sm text-muted">
            <th scope="col" className="px-6 py-4 font-medium">Billet</th>
            {COLUMNS.map((column) => (
              <th key={column.id} scope="col" className={`px-6 py-4 font-medium ${column.id === currentPhase ? "text-accent" : ""}`}>
                {column.label}
                <span className="block text-xs font-normal">
                  {column.id === currentPhase ? "En ce moment" : column.hint}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TICKET_TYPES.map((ticketType) => {
            const prices: Record<PriceTablePhase, number> = {
              ...ticketType.pricesInCents,
              onSite: getOnSitePriceInCents(ticketType),
            };
            return (
              <tr key={ticketType.id} className="border-b border-line last:border-b-0">
                <th scope="row" className="px-6 py-4 font-medium text-ink">{ticketType.label}</th>
                {COLUMNS.map((column) => (
                  <td
                    key={column.id}
                    className={`px-6 py-4 tabular-nums ${column.id === currentPhase ? "font-semibold text-ink" : "text-muted"}`}
                  >
                    {formatEuros(prices[column.id])}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
