import {
  GAUGE_CAPACITIES,
  LOW_AVAILABILITY_RATIO,
  MAX_DISCOUNT_RATIO,
  TICKET_GAUGES,
  TICKET_TYPES,
  type TicketGauge,
} from "@/features/tickets/content";
import type { TicketQuantities } from "@/features/tickets/pricing";

export type GaugeUsage = Record<TicketGauge, number>;

export type SeatAvailability = {
  capacity: number;
  seatsLeft: number;
  isLow: boolean;
  isSoldOut: boolean;
};

export type GaugeShortage = {
  gauge: TicketGauge;
  seatsLeft: number;
};

export type SalesTotals = {
  grossInCents: number;
  discountInCents: number;
};

const EMPTY_GAUGE_USAGE: GaugeUsage = { salon: 0, openingEvening: 0, masterclass: 0 };

/// Places consommées par jauge. Un pass 2 jours compte pour un visiteur.
export function getGaugeUsage(quantities: Partial<TicketQuantities>): GaugeUsage {
  return TICKET_TYPES.reduce(
    (usage, ticketType) => ({
      ...usage,
      [ticketType.gauge]: usage[ticketType.gauge] + (quantities[ticketType.id] ?? 0),
    }),
    EMPTY_GAUGE_USAGE,
  );
}

export function getSeatAvailability(capacity: number, seatsSold: number): SeatAvailability {
  const seatsLeft = Math.max(0, capacity - seatsSold);
  return {
    capacity,
    seatsLeft,
    isLow: seatsLeft > 0 && seatsLeft / capacity <= LOW_AVAILABILITY_RATIO,
    isSoldOut: seatsLeft === 0,
  };
}

/// Première jauge que la commande ferait déborder, ou null si tout tient.
export function findGaugeShortage(ordered: GaugeUsage, sold: GaugeUsage): GaugeShortage | null {
  for (const gauge of TICKET_GAUGES) {
    const seatsLeft = Math.max(0, GAUGE_CAPACITIES[gauge] - sold[gauge]);
    if (ordered[gauge] > seatsLeft) return { gauge, seatsLeft };
  }
  return null;
}

/// Les codes promo ne sont plus proposés une fois les remises arrivées au
/// plafond du chiffre d'affaires brut.
export function isDiscountCapReached({ grossInCents, discountInCents }: SalesTotals): boolean {
  if (grossInCents === 0) return false;
  return discountInCents / grossInCents >= MAX_DISCOUNT_RATIO;
}
