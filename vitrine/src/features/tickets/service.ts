import "server-only";

import { DomainError } from "@/lib/errors";
import { env } from "@/lib/env";
import { formatCount } from "@/lib/format";
import { EDITION } from "@/features/edition/content";
import { SALON_CAPACITY } from "@/features/tickets/content";
import {
  buildOrderLines,
  countSalonSeats,
  getSalePeriod,
  getSeatAvailability,
  type TicketQuantities,
} from "@/features/tickets/pricing";
import { getStripeClient } from "@/features/tickets/stripe-client";
import { createCheckoutSession, sumPaidSalonSeats } from "@/features/tickets/stripe-gateway";

/// Vérifie qu'une commande peut partir en paiement et renvoie l'adresse de la
/// page Stripe. La jauge est contrôlée ici, au dernier moment. Sans
/// réservation temporaire des places, deux paiements simultanés peuvent encore
/// la dépasser de quelques visiteurs : limite à faire valider par l'association.
export async function startCheckout(quantities: TicketQuantities, now: Date): Promise<string> {
  const period = getSalePeriod(now);
  if (!period.isSoldOnline) {
    throw new DomainError("tickets.salesClosed", "La vente en ligne est terminée : les billets sont en vente à l'entrée du Salon.");
  }

  const stripe = getStripeClient();
  if (!stripe) {
    throw new DomainError("tickets.paymentUnavailable", "Le paiement en ligne est momentanément indisponible.");
  }

  const salonSeats = countSalonSeats(quantities);
  if (salonSeats > 0) {
    const availability = getSeatAvailability(SALON_CAPACITY, await sumPaidSalonSeats(stripe, EDITION.year));
    if (salonSeats > availability.seatsLeft) {
      const message = availability.isSoldOut
        ? "Le Salon est complet."
        : `Il ne reste que ${formatCount(availability.seatsLeft)} places : réduisez votre commande.`;
      throw new DomainError("tickets.notEnoughSeats", message);
    }
  }

  return createCheckoutSession(stripe, {
    lines: buildOrderLines(quantities, period),
    salonSeats,
    editionYear: EDITION.year,
    siteUrl: env.SITE_URL,
    now,
  });
}
