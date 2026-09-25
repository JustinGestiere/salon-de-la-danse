/// Stripe n'accepte une expiration qu'entre 30 minutes et 24 heures après la
/// création de la session. On vise juste au-dessus du minimum, avec une marge
/// pour le délai réseau : une session abandonnée ne bloque pas longtemps un
/// visiteur qui paierait après la fermeture.
const CHECKOUT_SESSION_LIFETIME_SECONDS = 35 * 60;

/// Expiration de la session, en secondes Unix. Toujours calculée sur l'heure
/// réelle : la date simulée de la billetterie ne doit jamais atteindre Stripe.
export function getCheckoutSessionExpiry(realNow: Date): number {
  return Math.floor(realNow.getTime() / 1000) + CHECKOUT_SESSION_LIFETIME_SECONDS;
}
