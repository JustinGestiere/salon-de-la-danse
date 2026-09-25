import "server-only";

import type Stripe from "stripe";

import { getCheckoutSessionExpiry } from "@/features/tickets/checkout-expiry";
import type { OrderLine, TicketQuantities } from "@/features/tickets/pricing";
import { addQuantities, decodeQuantities, encodeQuantities } from "@/features/tickets/sales-metadata";
import type { TicketTypeId } from "@/features/tickets/content";

const CHECKOUT_PAGE_SIZE = 100;

type CreateCheckoutSessionParams = {
  lines: readonly OrderLine[];
  quantities: TicketQuantities;
  editionYear: number;
  siteUrl: string;
  allowPromotionCodes: boolean;
};

export type PaidSalesSummary = {
  quantities: Partial<Record<TicketTypeId, number>>;
  grossInCents: number;
  discountInCents: number;
};

export type PaidOrder = {
  email: string | null;
  totalInCents: number;
  lines: { id: string; description: string; quantity: number; totalInCents: number }[];
};

const EMPTY_SUMMARY: PaidSalesSummary = { quantities: {}, grossInCents: 0, discountInCents: 0 };

/// Pas de base de données côté vitrine : Stripe est la source de vérité des
/// ventes. Chaque session porte en métadonnées l'édition et les quantités par
/// type de billet ; les montants servent au plafond des codes promo.
export async function summarizePaidSales(stripe: Stripe, editionYear: number): Promise<PaidSalesSummary> {
  let summary = EMPTY_SUMMARY;
  for await (const session of stripe.checkout.sessions.list({ status: "complete", limit: CHECKOUT_PAGE_SIZE })) {
    if (session.payment_status !== "paid") continue;
    if (session.metadata?.edition !== String(editionYear)) continue;
    summary = {
      quantities: addQuantities(summary.quantities, decodeQuantities(session.metadata.quantities)),
      grossInCents: summary.grossInCents + (session.amount_subtotal ?? 0),
      discountInCents: summary.discountInCents + (session.total_details?.amount_discount ?? 0),
    };
  }
  return summary;
}

/// Crée la page de paiement hébergée par Stripe et renvoie son adresse.
export async function createCheckoutSession(stripe: Stripe, params: CreateCheckoutSessionParams): Promise<string> {
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    locale: "fr",
    submit_type: "pay",
    allow_promotion_codes: params.allowPromotionCodes,
    line_items: params.lines.map((line) => ({
      quantity: line.quantity,
      price_data: {
        currency: "eur",
        unit_amount: line.unitPriceInCents,
        product_data: { name: `${line.label}, Salon de la Danse ${params.editionYear}` },
      },
    })),
    metadata: { edition: String(params.editionYear), quantities: encodeQuantities(params.quantities) },
    expires_at: getCheckoutSessionExpiry(new Date()),
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
