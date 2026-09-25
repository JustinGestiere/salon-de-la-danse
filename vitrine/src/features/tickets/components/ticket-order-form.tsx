"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { formatEuros } from "@/lib/format";
import { startCheckoutAction } from "@/features/tickets/actions";
import { MAX_QUANTITY_PER_TICKET_TYPE, TERMS_OF_SALE_URL, type TicketTypeId } from "@/features/tickets/content";
import { checkoutInputSchema, type CheckoutInput } from "@/features/tickets/schemas";
import { QuantityStepper } from "@/features/tickets/components/quantity-stepper";

export type TicketOffer = {
  id: TicketTypeId;
  label: string;
  audience: string;
  unitPriceInCents: number;
};

type TicketOrderFormProps = {
  offers: readonly TicketOffer[];
};

const EMPTY_QUANTITIES: CheckoutInput["quantities"] = {
  adultOneDay: 0,
  adultTwoDays: 0,
  reducedOneDay: 0,
  reducedTwoDays: 0,
  familyOneDay: 0,
  familyTwoDays: 0,
  openingCeremony: 0,
};

/// Le total affiché n'est qu'indicatif : le serveur recalcule les prix avant
/// de créer le paiement.
function getDisplayedTotal(offers: readonly TicketOffer[], quantities: CheckoutInput["quantities"]): number {
  return offers.reduce((total, offer) => total + offer.unitPriceInCents * (quantities[offer.id] || 0), 0);
}

export function TicketOrderForm({ offers }: TicketOrderFormProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const {
    control,
    register,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutInputSchema),
    defaultValues: { quantities: EMPTY_QUANTITIES, acceptsTermsOfSale: false },
  });
  const quantities = useWatch({ control, name: "quantities" });
  const total = getDisplayedTotal(offers, quantities);

  async function onSubmit(values: CheckoutInput): Promise<void> {
    setFormError(null);
    const result = await startCheckoutAction(values);
    if (!result.ok) {
      setFormError(result.error.message);
      return;
    }
    window.location.assign(result.data.checkoutUrl);
  }

  const isRedirecting = isSubmitting || (isSubmitSuccessful && formError === null);
  const quantitiesError = errors.quantities?.root?.message ?? errors.quantities?.message;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      <ul className="flex flex-col border-t border-line-strong">
        {offers.map((offer) => (
          <li key={offer.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-3 border-b border-line py-5 sm:grid-cols-[minmax(0,1fr)_110px_auto]">
            <div className="flex flex-col gap-1">
              <span className="text-lg font-semibold text-ink" id={`offre-${offer.id}`}>{offer.label}</span>
              <span className="text-sm text-muted">{offer.audience}</span>
            </div>
            <span className="font-display text-3xl text-accent sm:text-right">{formatEuros(offer.unitPriceInCents)}</span>
            <QuantityStepper
              labelId={`offre-${offer.id}`}
              value={quantities[offer.id] || 0}
              max={MAX_QUANTITY_PER_TICKET_TYPE}
              onChange={(value) => setValue(`quantities.${offer.id}`, value, { shouldValidate: true })}
              inputProps={register(`quantities.${offer.id}`, { valueAsNumber: true })}
              className="col-span-2 justify-self-start sm:col-span-1 sm:justify-self-end"
            />
          </li>
        ))}
      </ul>
      {quantitiesError ? <p role="alert" className="text-sm text-danger-ink">{quantitiesError}</p> : null}

      <div className="flex flex-col gap-5 rounded-[28px] border border-line-strong bg-raised p-6 sm:p-8">
        <p className="flex items-baseline justify-between gap-4">
          <span className="text-lg text-ink-soft">Total</span>
          <span className="font-display text-5xl text-ink" aria-live="polite">{formatEuros(total)}</span>
        </p>
        <label className="flex items-start gap-3 text-[15px] leading-relaxed text-ink-soft">
          <input type="checkbox" className="mt-1 size-5 shrink-0 accent-[var(--site-accent)]" {...register("acceptsTermsOfSale")} />
          <span>
            J'accepte les{" "}
            <a href={TERMS_OF_SALE_URL} target="_blank" rel="noopener noreferrer" className="font-medium text-accent underline-offset-4 hover:underline">
              conditions générales de vente
            </a>
            .
          </span>
        </label>
        {errors.acceptsTermsOfSale?.message ? (
          <p role="alert" className="text-sm text-danger-ink">{errors.acceptsTermsOfSale.message}</p>
        ) : null}
        {formError ? <p role="alert" className="rounded-2xl bg-danger-soft px-4 py-3 text-sm text-danger-ink">{formError}</p> : null}
        <button
          type="submit"
          disabled={isRedirecting}
          aria-busy={isRedirecting || undefined}
          className="bg-sunset inline-flex min-h-14 items-center justify-center rounded-full px-7 font-semibold text-on-accent shadow-[0_10px_30px_var(--site-glow)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isRedirecting ? "Redirection vers le paiement…" : "Payer par carte"}
        </button>
        <p className="text-sm text-subtle">Paiement sécurisé par Stripe. Vous recevez votre reçu par e-mail.</p>
      </div>
    </form>
  );
}
