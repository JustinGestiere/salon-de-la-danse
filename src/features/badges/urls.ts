import "server-only";

import { env } from "@/lib/env";

/// Adresse encodée dans le QR code du badge. Absolue : elle est ouverte depuis
/// le téléphone de l'accueil, hors de l'application.
export function buildVerificationUrl(volunteerId: string): string {
  return new URL(`/admin/verification/${encodeURIComponent(volunteerId)}`, env.NEXT_PUBLIC_APP_URL).toString();
}
