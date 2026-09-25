"use server";

import { z } from "zod";

import { isDomainError } from "@/lib/errors";
import { fail, ok, type ActionResult } from "@/lib/result";
import { checkoutInputSchema } from "@/features/tickets/schemas";
import { startCheckout } from "@/features/tickets/service";

/// Lance le paiement. Achat public : pas de compte à vérifier, mais rien ne
/// vient du navigateur à part les quantités (prix et période sont recalculés
/// côté serveur). Aucun cache à invalider : les ventes ne comptent qu'une fois
/// payées, et le compteur se relit tout seul.
export async function startCheckoutAction(input: unknown): Promise<ActionResult<{ checkoutUrl: string }>> {
  const parsed = checkoutInputSchema.safeParse(input);
  if (!parsed.success) {
    return fail("validation", "Vérifiez votre commande.", z.flattenError(parsed.error).fieldErrors);
  }

  try {
    const checkoutUrl = await startCheckout(parsed.data.quantities, new Date());
    return ok({ checkoutUrl });
  } catch (error) {
    if (isDomainError(error)) return fail(error.code, error.message);
    console.error("[startCheckoutAction]", error);
    return fail("unexpected", "Le paiement n'a pas pu démarrer. Réessayez dans un instant.");
  }
}
