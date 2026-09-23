"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { AdminButton } from "@/components/admin/admin-button";
import { Stepper } from "@/components/admin/stepper";
import { updateSlotCapacityAction } from "@/features/planning/admin-actions";
import { MAX_SLOT_CAPACITY } from "@/features/planning/admin-schemas";

type CapacityEditorProps = {
  missionSlotId: string;
  capacity: number;
  filled: number;
};

export function CapacityEditor({ missionSlotId, capacity, filled }: CapacityEditorProps) {
  const router = useRouter();
  const [draft, setDraft] = useState(capacity);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const isDirty = draft !== capacity;

  function save(): void {
    setError(null);
    startTransition(async () => {
      const result = await updateSlotCapacityAction({ missionSlotId, capacity: draft });
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-3xl bg-raised p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-ink">Jauge du créneau</span>
          <span className="text-xs text-subtle">{filled} inscrit{filled > 1 ? "s" : ""}</span>
        </div>
        <Stepper label="Jauge du créneau" value={draft} min={0} max={MAX_SLOT_CAPACITY} onChange={setDraft} disabled={isPending} />
      </div>
      {draft < filled ? (
        <p className="rounded-2xl bg-warn-soft px-3 py-2 text-xs text-warn-ink">
          La jauge passe sous le nombre d'inscrits. Personne n'est retiré automatiquement : à régler à la main.
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="text-xs text-danger-ink">
          {error}
        </p>
      ) : null}
      {isDirty ? (
        <div className="flex gap-2">
          <AdminButton size="sm" variant="primary" onClick={save} isLoading={isPending}>
            Enregistrer la jauge
          </AdminButton>
          <AdminButton size="sm" variant="ghost" onClick={() => setDraft(capacity)} disabled={isPending}>
            Annuler
          </AdminButton>
        </div>
      ) : null}
    </div>
  );
}
