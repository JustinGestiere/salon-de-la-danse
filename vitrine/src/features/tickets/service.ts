import "server-only";

import type Stripe from "stripe";

import { DomainError } from "@/lib/errors";
import { env } from "@/lib/env";
import { formatCount } from "@/lib/format";
import { EDITION } from "@/features/edition/content";
import { isPrivateSaleAccessCodeValid } from "@/features/tickets/access-code";
import { GAUGE_LABELS, type SalePhase } from "@/features/tickets/content";
import { buildOrderLines, getSaleStatus, type TicketQuantities } from "@/features/tickets/pricing";
import { findGaugeShortage, getGaugeUsage, isDiscountCapReached } from "@/features/tickets/quotas";
import { getStripeClient } from "@/features/tickets/stripe-client";
import { createCheckoutSession, summarizePaidSales, type PaidSalesSummary } from "@/features/tickets/stripe-gateway";

type StartCheckoutParams = {
  quantities: TicketQuantities;
  accessCode: string | undefined;
  now: Date;
};

/// Phase de vente en cours, et droit d'y acheter (code de la vente privée).
function resolveOpenPhase(now: Date, accessCode: string | undefined): SalePhase {
  const status = getSaleStatus(now);
  if (status.kind === "ended") {
    throw new DomainError("tickets.salesEnded", "La vente en ligne est terminée : les billets sont en vente au guichet du Salon.");
  }
  if (status.kind === "upcoming") {
    throw new DomainError("tickets.salesNotOpen", "La billetterie en ligne n'est pas encore ouverte.");
  }
  if (status.phase.isPrivate && !isPrivateSaleAccessCodeValid(accessCode)) {
    throw new DomainError("tickets.accessCodeInvalid", "Code de vente privée incorrect.");
  }
  return status.phase;
}

function getStripeOrThrow(): Stripe {
  const stripe = getStripeClient();
  if (!stripe) {
    throw new DomainError("tickets.paymentUnavailable", "Le paiement en ligne est momentanément indisponible.");
  }
  return stripe;
}

/// Refuse une commande qui ferait déborder une jauge (Salon, soirée, masterclass).
function assertSeatsAvailable(quantities: TicketQuantities, sales: PaidSalesSummary): void {
  const shortage = findGaugeShortage(getGaugeUsage(quantities), getGaugeUsage(sales.quantities));
  if (!shortage) return;
  const target = GAUGE_LABELS[shortage.gauge];
  const message =
    shortage.seatsLeft === 0
      ? `Plus de places en ligne pour ${target}.`
      : `Il ne reste que ${formatCount(shortage.seatsLeft)} places pour ${target} : réduisez votre commande.`;
  throw new DomainError("tickets.notEnoughSeats", message);
}

/// Vérifie qu'une commande peut partir en paiement et renvoie l'adresse de la
/// page Stripe. Les jauges sont contrôlées au dernier moment. Sans réservation
/// temporaire des places, deux paiements simultanés peuvent encore les
/// dépasser de quelques billets : limite à faire valider par l'association.
export async function startCheckout({ quantities, accessCode, now }: StartCheckoutParams): Promise<string> {
  const phase = resolveOpenPhase(now, accessCode);
  const stripe = getStripeOrThrow();
  const sales = await summarizePaidSales(stripe, EDITION.year);
  assertSeatsAvailable(quantities, sales);

  return createCheckoutSession(stripe, {
    lines: buildOrderLines(quantities, phase.priceTier),
    quantities,
    editionYear: EDITION.year,
    siteUrl: env.SITE_URL,
    now,
    allowPromotionCodes: !isDiscountCapReached(sales),
  });
}
