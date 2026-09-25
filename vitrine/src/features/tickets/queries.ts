import "server-only";

import { unstable_cache } from "next/cache";

import { EDITION } from "@/features/edition/content";
import { GAUGE_CAPACITIES } from "@/features/tickets/content";
import { getGaugeUsage, getSeatAvailability, type SeatAvailability } from "@/features/tickets/quotas";
import { getStripeClient } from "@/features/tickets/stripe-client";
import { retrievePaidOrder, summarizePaidSales, type PaidOrder, type PaidSalesSummary } from "@/features/tickets/stripe-gateway";

/// Le compteur s'affiche sur chaque page d'accueil : on ne relit Stripe
/// qu'une fois par minute. unstable_cache plutôt que « use cache », qui
/// exigerait Cache Components alors que le layout lit le cookie de thème.
const SALES_CACHE_SECONDS = 60;

const getCachedSalesSummary = unstable_cache(
  async (): Promise<PaidSalesSummary | null> => {
    const stripe = getStripeClient();
    if (!stripe) return null;
    return summarizePaidSales(stripe, EDITION.year);
  },
  ["paid-sales-summary", String(EDITION.year)],
  { revalidate: SALES_CACHE_SECONDS, tags: ["paid-sales"] },
);

/// Places restantes pour le Salon, ou null si la billetterie en ligne n'est
/// pas branchée ou que Stripe ne répond pas : la page s'affiche quand même.
export async function getSeatAvailabilityForDisplay(): Promise<SeatAvailability | null> {
  try {
    const summary = await getCachedSalesSummary();
    if (!summary) return null;
    return getSeatAvailability(GAUGE_CAPACITIES.salon, getGaugeUsage(summary.quantities).salon);
  } catch (error) {
    console.error("[tickets] lecture des ventes Stripe impossible", error);
    return null;
  }
}

/// Récapitulatif de la page de remerciement. null si la session ne
/// correspond pas à une commande payée de cette édition.
export async function getOrderConfirmation(sessionId: string): Promise<PaidOrder | null> {
  const stripe = getStripeClient();
  if (!stripe) return null;
  try {
    return await retrievePaidOrder(stripe, sessionId, EDITION.year);
  } catch (error) {
    console.error("[tickets] session Stripe introuvable", { sessionId, error });
    return null;
  }
}
