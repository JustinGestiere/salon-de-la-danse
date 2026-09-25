import {
  LOW_AVAILABILITY_RATIO,
  SALE_PERIODS,
  TICKET_TYPES,
  type SalePeriod,
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

export type SeatAvailability = {
  capacity: number;
  seatsLeft: number;
  isLow: boolean;
  isSoldOut: boolean;
};

/// Période tarifaire en vigueur à cet instant. Au-delà de la dernière date,
/// seule la vente sur place reste possible.
export function getSalePeriod(now: Date): SalePeriod {
  const current = SALE_PERIODS.find(
    (period) => period.endsAt === null || now.getTime() < Date.parse(period.endsAt),
  );
  // La dernière période n'a pas de fin : find() trouve toujours une entrée.
  return current ?? SALE_PERIODS[SALE_PERIODS.length - 1]!;
}

/// Lignes de commande non vides, avec les prix de la période. Les prix ne
/// viennent jamais du navigateur : seulement les quantités.
export function buildOrderLines(quantities: TicketQuantities, period: SalePeriod): OrderLine[] {
  return TICKET_TYPES.filter((ticketType) => quantities[ticketType.id] > 0).map((ticketType) => {
    const quantity = quantities[ticketType.id];
    const unitPriceInCents = ticketType.pricesInCents[period.id];
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

/// Visiteurs que la commande fait entrer au Salon (un pack famille compte 4).
export function countSalonSeats(quantities: TicketQuantities): number {
  return TICKET_TYPES.reduce(
    (seats, ticketType) => seats + ticketType.salonSeats * quantities[ticketType.id],
    0,
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
