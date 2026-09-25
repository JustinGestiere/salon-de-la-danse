import { z } from "zod";

import { MAX_QUANTITY_PER_TICKET_TYPE } from "@/features/tickets/content";

const quantitySchema = z
  .number({ message: "Quantité invalide." })
  .int("Quantité invalide.")
  .min(0, "Quantité invalide.")
  .max(MAX_QUANTITY_PER_TICKET_TYPE, `${MAX_QUANTITY_PER_TICKET_TYPE} billets maximum par tarif.`);

export const ticketQuantitiesSchema = z.object({
  adultOneDay: quantitySchema,
  adultTwoDays: quantitySchema,
  reducedOneDay: quantitySchema,
  reducedTwoDays: quantitySchema,
  familyOneDay: quantitySchema,
  familyTwoDays: quantitySchema,
  openingCeremony: quantitySchema,
});

/// Même schéma pour le formulaire (React Hook Form) et la Server Action.
export const checkoutInputSchema = z.object({
  quantities: ticketQuantitiesSchema.refine(
    (quantities) => Object.values(quantities).some((quantity) => quantity > 0),
    { message: "Choisissez au moins un billet." },
  ),
  // Un booléen affiné plutôt que z.literal(true) : la case démarre décochée
  // dans le formulaire, ce qu'un littéral interdirait comme valeur initiale.
  acceptsTermsOfSale: z.boolean().refine((isAccepted) => isAccepted, {
    message: "Acceptez les conditions générales de vente pour continuer.",
  }),
});

export type CheckoutInput = z.infer<typeof checkoutInputSchema>;

/// Identifiant de session Stripe Checkout reçu dans l'URL de retour.
export const checkoutSessionIdSchema = z.string().regex(/^cs_(test|live)_[A-Za-z0-9]+$/);
