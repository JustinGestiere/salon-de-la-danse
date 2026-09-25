import {
  ON_SITE_SURCHARGE_IN_CENTS,
  SALE_PHASES,
  TICKET_TYPES,
  type PriceTier,
  type SalePhase,
  type TicketType,
  type TicketTypeId,
} from "@/features/tickets/content";

export type TicketQuantities = Record<TicketTypeId, number>;

export type OrderLine = {
  ticketTypeId: TicketTypeId;
  label: string;
  quantity: number;
  unitPriceInCents: number;
  totalInCents: number;
};

/// Où en est la billetterie en ligne à un instant donné.
export type SaleStatus =
  | { kind: "open"; phase: SalePhase }
  | { kind: "upcoming"; nextPhase: SalePhase }
  | { kind: "ended" };

export function getSaleStatus(now: Date): SaleStatus {
  const time = now.getTime();
  const openPhase = SALE_PHASES.find(
    (phase) => Date.parse(phase.startsAt) <= time && time < Date.parse(phase.endsAt),
  );
  if (openPhase) return { kind: "open", phase: openPhase };

  const nextPhase = SALE_PHASES.find((phase) => time < Date.parse(phase.startsAt));
  if (nextPhase) return { kind: "upcoming", nextPhase };

  return { kind: "ended" };
}

/// Dernier jour de vente d'une phase (sa fin est exclue).
export function getPhaseLastDay(phase: SalePhase): Date {
  return new Date(Date.parse(phase.endsAt) - 1);
}

export function getOnSitePriceInCents(ticketType: TicketType): number {
  return ticketType.pricesInCents.fullPrice + ON_SITE_SURCHARGE_IN_CENTS;
}

/// Lignes de commande non vides, au tarif de la phase. Les prix ne viennent
/// jamais du navigateur : seulement les quantités.
export function buildOrderLines(quantities: TicketQuantities, priceTier: PriceTier): OrderLine[] {
  return TICKET_TYPES.filter((ticketType) => quantities[ticketType.id] > 0).map((ticketType) => {
    const quantity = quantities[ticketType.id];
    const unitPriceInCents = ticketType.pricesInCents[priceTier];
    return {
      ticketTypeId: ticketType.id,
      label: ticketType.label,
      quantity,
      unitPriceInCents,
      totalInCents: unitPriceInCents * quantity,
    };
  });
}

export function getOrderTotalInCents(lines: readonly OrderLine[]): number {
  return lines.reduce((total, line) => total + line.totalInCents, 0);
}
