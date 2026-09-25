import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";

import { env } from "@/lib/env";

function digest(value: string): Buffer {
  return createHash("sha256").update(value.trim().toUpperCase()).digest();
}

/// Vérifie le code de la vente privée. Comparaison à temps constant sur des
/// empreintes de même longueur, pour ne rien laisser deviner du code.
export function isPrivateSaleAccessCodeValid(candidate: string | undefined): boolean {
  if (!env.PRIVATE_SALE_ACCESS_CODE || !candidate) return false;
  return timingSafeEqual(digest(candidate), digest(env.PRIVATE_SALE_ACCESS_CODE));
}
