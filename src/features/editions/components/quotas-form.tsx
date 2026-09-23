"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { AdminAlert } from "@/components/admin/admin-alert";
import { AdminButton } from "@/components/admin/admin-button";
import { Stepper } from "@/components/admin/stepper";
import { updateQuotasAction } from "@/features/editions/admin-actions";
import { MAX_SLOTS_QUOTA, type QuotasInput } from "@/features/editions/admin-schemas";

function describeRules(quotas: QuotasInput): string {
  const maxLabel = `${quotas.maxSlots} créneau${quotas.maxSlots > 1 ? "x" : ""}`;
  return `Chaque bénévole choisit entre ${quotas.minSlots} et ${maxLabel}, jamais plus de ${quotas.maxConsecutive} à la suite.`;
}

type QuotaField = { key: keyof QuotasInput; label: string; hint: string; min: (quotas: QuotasInput) => number; max: (quotas: QuotasInput) => number };

const FIELDS: readonly QuotaField[] = [
  { key: "minSlots", label: "Créneaux minimum", hint: "Par bénévole, sur le week-end", min: () => 1, max: (quotas) => quotas.maxSlots },
  { key: "maxSlots", label: "Créneaux maximum", hint: "Par bénévole, sur le week-end", min: (quotas) => quotas.minSlots, max: () => MAX_SLOTS_QUOTA },
  { key: "maxConsecutive", label: "À la suite, au plus", hint: "Au-delà, pause obligatoire", min: () => 1, max: () => MAX_SLOTS_QUOTA },
];

/// Règles du planning réglées au pas de un, avec leur traduction en phrase :
/// l'admin voit tout de suite ce que le bénévole lira.
export function QuotasForm({ initialQuotas }: { initialQuotas: QuotasInput }) {
  const router = useRouter();
  const [quotas, setQuotas] = useState(initialQuotas);
  const [feedback, setFeedback] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const isDirty = FIELDS.some((field) => quotas[field.key] !== initialQuotas[field.key]);

  function save(): void {
    setFeedback(null);
    startTransition(async () => {
      const result = await updateQuotasAction(quotas);
      if (!result.ok) {
        setFeedback({ tone: "error", text: result.error.message });
        return;
      }
      setFeedback({ tone: "success", text: "Règles enregistrées." });
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <p aria-live="polite" className="mb-2 font-display text-2xl italic leading-snug text-accent-strong">
        {describeRules(quotas)}
      </p>
      {FIELDS.map((field) => (
        <div key={field.key} className="flex items-center justify-between gap-4 border-t border-line py-3">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-ink">{field.label}</span>
            <span className="text-xs text-subtle">{field.hint}</span>
          </div>
          <Stepper
            label={field.label}
            value={quotas[field.key]}
            min={field.min(quotas)}
            max={field.max(quotas)}
            disabled={isPending}
            onChange={(value) => setQuotas((current) => ({ ...current, [field.key]: value }))}
          />
        </div>
      ))}
      {feedback ? <AdminAlert tone={feedback.tone}>{feedback.text}</AdminAlert> : null}
      {isDirty ? (
        <div className="flex gap-2 pt-2">
          <AdminButton variant="primary" onClick={save} isLoading={isPending}>
            Enregistrer les règles
          </AdminButton>
          <AdminButton variant="ghost" onClick={() => setQuotas(initialQuotas)} disabled={isPending}>
            Annuler
          </AdminButton>
        </div>
      ) : null}
    </div>
  );
}
