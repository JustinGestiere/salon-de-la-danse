import "server-only";

import { env } from "@/lib/env";

/// Heure de référence de la billetterie. En développement, elle peut être
/// avancée pour tester une phase de vente sans attendre 2027.
export function getTicketingNow(): Date {
  if (env.NODE_ENV !== "production" && env.TICKETING_CLOCK_OVERRIDE) {
    return new Date(env.TICKETING_CLOCK_OVERRIDE);
  }
  return new Date();
}
