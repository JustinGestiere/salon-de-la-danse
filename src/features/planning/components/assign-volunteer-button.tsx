"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { AdminButton, type AdminButtonVariant } from "@/components/admin/admin-button";
import { assignVolunteerAction } from "@/features/planning/admin-actions";
import { OVERRIDE_REQUIRED_CODE } from "@/features/planning/admin-schemas";

type AssignVolunteerButtonProps = {
  missionSlotId: string;
  volunteerId: string;
  label: string;
  variant?: AdminButtonVariant;
};

/// Affecte un bénévole à une case. Si une règle ou la jauge bloque, le motif
/// s'affiche et l'admin peut confirmer la dérogation, qui sera tracée.
export function AssignVolunteerButton({
  missionSlotId,
  volunteerId,
  label,
  variant = "secondary",
}: AssignVolunteerButtonProps) {
  const router = useRouter();
  const [overrideReason, setOverrideReason] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function assign(force: boolean): void {
    setError(null);
    startTransition(async () => {
      const result = await assignVolunteerAction({ missionSlotId, volunteerId, force });
      if (result.ok) {
        setOverrideReason(null);
        router.refresh();
        return;
      }
      if (result.error.code === OVERRIDE_REQUIRED_CODE) {
        setOverrideReason(result.error.message);
        return;
      }
      setOverrideReason(null);
      setError(result.error.message);
    });
  }

  if (overrideReason) {
    return (
      <div className="flex flex-col gap-2 rounded-2xl bg-warn-soft p-3 text-sm text-warn-ink">
        <p role="alert">{overrideReason}</p>
        <div className="flex gap-2">
          <AdminButton size="sm" variant="primary" onClick={() => assign(true)} isLoading={isPending}>
            Forcer l'attribution
          </AdminButton>
          <AdminButton size="sm" variant="ghost" onClick={() => setOverrideReason(null)} disabled={isPending}>
            Annuler
          </AdminButton>
        </div>
      </div>
    );
  }

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <AdminButton size="sm" variant={variant} onClick={() => assign(false)} isLoading={isPending}>
        {label}
      </AdminButton>
      {error ? (
        <span role="alert" className="text-xs text-danger-ink">
          {error}
        </span>
      ) : null}
    </span>
  );
}
