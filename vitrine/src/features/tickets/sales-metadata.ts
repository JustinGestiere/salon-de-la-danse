import { z } from "zod";

import { TICKET_TYPE_IDS, type TicketTypeId } from "@/features/tickets/content";
import type { TicketQuantities } from "@/features/tickets/pricing";

// Les métadonnées Stripe sont des chaînes de 500 caractères au plus : les
// quantités y sont rangées sous la forme « discoveryPass=2;masterclassSession=1 ».
const ENTRY_SEPARATOR = ";";
const VALUE_SEPARATOR = "=";

const ticketTypeIdSchema = z.enum(TICKET_TYPE_IDS);
const quantitySchema = z.coerce.number().int().positive();

export function encodeQuantities(quantities: TicketQuantities): string {
  return TICKET_TYPE_IDS.filter((id) => quantities[id] > 0)
    .map((id) => `${id}${VALUE_SEPARATOR}${quantities[id]}`)
    .join(ENTRY_SEPARATOR);
}

/// Lecture tolérante : une entrée illisible est ignorée plutôt que de fausser
/// tout le décompte (la donnée vient d'un service externe).
export function decodeQuantities(value: string | undefined): Partial<Record<TicketTypeId, number>> {
  if (!value) return {};
  return value.split(ENTRY_SEPARATOR).reduce<Partial<Record<TicketTypeId, number>>>((quantities, entry) => {
    const [rawId, rawQuantity] = entry.split(VALUE_SEPARATOR);
    const id = ticketTypeIdSchema.safeParse(rawId);
    const quantity = quantitySchema.safeParse(rawQuantity);
    if (!id.success || !quantity.success) return quantities;
    return { ...quantities, [id.data]: (quantities[id.data] ?? 0) + quantity.data };
  }, {});
}

/// Additionne deux décomptes par type de billet.
export function addQuantities(
  total: Partial<Record<TicketTypeId, number>>,
  extra: Partial<Record<TicketTypeId, number>>,
): Partial<Record<TicketTypeId, number>> {
  return TICKET_TYPE_IDS.reduce(
    (sum, id) => ({ ...sum, [id]: (total[id] ?? 0) + (extra[id] ?? 0) }),
    {},
  );
}
