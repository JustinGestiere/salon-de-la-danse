import { formatEuros } from "@/lib/format";
import { SALE_PERIODS, TICKET_TYPES, type SalePeriodId } from "@/features/tickets/content";

type PriceTableProps = {
  currentPeriodId: SalePeriodId;
};

/// Grille complète des tarifs, période en cours mise en avant.
export function PriceTable({ currentPeriodId }: PriceTableProps) {
  return (
    <div className="overflow-x-auto rounded-[28px] border border-line">
      <table className="w-full min-w-[640px] border-collapse text-left">
        <caption className="sr-only">Tarifs selon la date d'achat</caption>
        <thead>
          <tr className="border-b border-line-strong text-sm text-muted">
            <th scope="col" className="px-6 py-4 font-medium">Billet</th>
            {SALE_PERIODS.map((period) => (
              <th
                key={period.id}
                scope="col"
                className={`px-6 py-4 font-medium ${period.id === currentPeriodId ? "text-accent" : ""}`}
              >
                {period.label}
                {period.id === currentPeriodId ? <span className="block text-xs">En ce moment</span> : null}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TICKET_TYPES.map((ticketType) => (
            <tr key={ticketType.id} className="border-b border-line last:border-b-0">
              <th scope="row" className="px-6 py-4 font-medium text-ink">{ticketType.label}</th>
              {SALE_PERIODS.map((period) => (
                <td
                  key={period.id}
                  className={`px-6 py-4 tabular-nums ${period.id === currentPeriodId ? "font-semibold text-ink" : "text-muted"}`}
                >
                  {formatEuros(ticketType.pricesInCents[period.id])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
