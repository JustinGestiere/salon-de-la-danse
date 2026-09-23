"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { AdminButton, type AdminButtonVariant } from "@/components/admin/admin-button";
import type { ActionResult } from "@/lib/result";

type ConfirmActionButtonProps = {
  label: string;
  confirmLabel: string;
  action: () => Promise<ActionResult<unknown>>;
  variant?: AdminButtonVariant;
};

/// Action sensible confirmée en deux temps, dans le flux de la page plutôt que
/// par une boîte de dialogue native qui bloque le navigateur.
export function ConfirmActionButton({
  label,
  confirmLabel,
  action,
  variant = "danger",
}: ConfirmActionButtonProps) {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function confirm(): void {
    setError(null);
    startTransition(async () => {
      const result = await action();
      setIsConfirming(false);
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      router.refresh();
    });
  }

  if (!isConfirming) {
    return (
      <span className="inline-flex flex-col items-end gap-1">
        <AdminButton size="sm" variant={variant} onClick={() => setIsConfirming(true)}>
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

  return (
    <span className="inline-flex items-center gap-2">
      <AdminButton size="sm" variant={variant} onClick={confirm} isLoading={isPending}>
        {confirmLabel}
      </AdminButton>
      <AdminButton size="sm" variant="ghost" onClick={() => setIsConfirming(false)} disabled={isPending}>
        Annuler
      </AdminButton>
    </span>
  );
}
