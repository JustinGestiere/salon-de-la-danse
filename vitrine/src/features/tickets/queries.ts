import "server-only";

import { unstable_cache } from "next/cache";

import { EDITION } from "@/features/edition/content";
import { SALON_CAPACITY } from "@/features/tickets/content";
import { getSeatAvailability, type SeatAvailability } from "@/features/tickets/pricing";
import { getStripeClient } from "@/features/tickets/stripe-client";
import { retrievePaidOrder, sumPaidSalonSeats, type PaidOrder } from "@/features/tickets/stripe-gateway";

/// Le compteur s'affiche sur chaque page d'accueil : on ne relit Stripe
/// qu'une fois par minute. unstable_cache plutôt que « use cache », qui
/// exigerait Cache Components alors que le layout lit le cookie de thème.
const SEATS_CACHE_SECONDS = 60;

const getCachedSeatsSold = unstable_cache(
  async (): Promise<number | null> => {
    const stripe = getStripeClient();
    if (!stripe) return null;
    return sumPaidSalonSeats(stripe, EDITION.year);
  },
  ["salon-seats-sold", String(EDITION.year)],
  { revalidate: SEATS_CACHE_SECONDS, tags: ["salon-seats"] },
);

/// Places restantes pour l'affichage, ou null si la billetterie en ligne n'est
/// pas branchée ou que Stripe ne répond pas : la page s'affiche quand même.
export async function getSeatAvailabilityForDisplay(): Promise<SeatAvailability | null> {
  try {
    const seatsSold = await getCachedSeatsSold();
    return seatsSold === null ? null : getSeatAvailability(SALON_CAPACITY, seatsSold);
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
