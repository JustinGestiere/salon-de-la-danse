import "server-only";

import type Stripe from "stripe";

import type { OrderLine } from "@/features/tickets/pricing";

/// Durée de vie minimale acceptée par Stripe : une session abandonnée ne
/// bloque pas longtemps un visiteur qui paierait après la fermeture.
const CHECKOUT_SESSION_LIFETIME_SECONDS = 30 * 60;

const CHECKOUT_PAGE_SIZE = 100;

type CreateCheckoutSessionParams = {
  lines: readonly OrderLine[];
  salonSeats: number;
  editionYear: number;
  siteUrl: string;
  now: Date;
};

export type PaidOrder = {
  email: string | null;
  totalInCents: number;
  lines: { id: string; description: string; quantity: number; totalInCents: number }[];
};

/// Pas de base de données côté vitrine : Stripe est la source de vérité des
/// ventes. Chaque session porte en métadonnées l'édition et le nombre de
/// visiteurs qu'elle fait entrer.
export async function sumPaidSalonSeats(stripe: Stripe, editionYear: number): Promise<number> {
  let seats = 0;
  for await (const session of stripe.checkout.sessions.list({ status: "complete", limit: CHECKOUT_PAGE_SIZE })) {
    if (session.payment_status !== "paid") continue;
    if (session.metadata?.edition !== String(editionYear)) continue;
    seats += Number.parseInt(session.metadata.salonSeats ?? "0", 10) || 0;
  }
  return seats;
}

/// Crée la page de paiement hébergée par Stripe et renvoie son adresse.
export async function createCheckoutSession(stripe: Stripe, params: CreateCheckoutSessionParams): Promise<string> {
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    locale: "fr",
    submit_type: "pay",
    line_items: params.lines.map((line) => ({
      quantity: line.quantity,
      price_data: {
        currency: "eur",
        unit_amount: line.unitPriceInCents,
        product_data: { name: `${line.label}, Salon de la Danse ${params.editionYear}` },
      },
    })),
    metadata: { edition: String(params.editionYear), salonSeats: String(params.salonSeats) },
    expires_at: Math.floor(params.now.getTime() / 1000) + CHECKOUT_SESSION_LIFETIME_SECONDS,
    success_url: `${params.siteUrl}/billetterie/merci?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${params.siteUrl}/billetterie?paiement=annule`,
  });

  if (!session.url) throw new Error(`Session Stripe ${session.id} créée sans adresse de paiement`);
  return session.url;
}

/// Commande payée pour cette édition, ou null (session inconnue, impayée ou
/// d'une autre édition). Une session inexistante lève une erreur Stripe.
export async function retrievePaidOrder(
  stripe: Stripe,
  sessionId: string,
  editionYear: number,
): Promise<PaidOrder | null> {
  const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["line_items"] });
  if (session.payment_status !== "paid") return null;
  if (session.metadata?.edition !== String(editionYear)) return null;

  return {
    email: session.customer_details?.email ?? null,
    totalInCents: session.amount_total ?? 0,
    lines: (session.line_items?.data ?? []).map((item) => ({
      id: item.id,
      description: item.description ?? "Billet",
      quantity: item.quantity ?? 1,
      totalInCents: item.amount_total,
    })),
  };
}
