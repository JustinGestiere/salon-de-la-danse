import "server-only";

import Stripe from "stripe";

import { env } from "@/lib/env";

let stripeClient: Stripe | null = null;

/// Client Stripe unique pour tout le serveur. null quand aucune clé n'est
/// configurée : la billetterie l'annonce au lieu de planter.
export function getStripeClient(): Stripe | null {
  if (!env.STRIPE_SECRET_KEY) return null;
  stripeClient ??= new Stripe(env.STRIPE_SECRET_KEY);
  return stripeClient;
}
