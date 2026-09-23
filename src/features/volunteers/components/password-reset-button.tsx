"use client";

import { useState, useTransition } from "react";

import { AdminButton } from "@/components/admin/admin-button";
import { resetVolunteerPasswordAction } from "@/features/volunteers/admin-actions";

type PasswordResetButtonProps = {
  volunteerId: string;
};

/// Réinitialisation en deux temps. Le mot de passe provisoire n'est affiché
/// qu'une fois : il n'est stocké nulle part en clair.
export function PasswordResetButton({ volunteerId }: PasswordResetButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  function reset(): void {
    setError(null);
    startTransition(async () => {
      const result = await resetVolunteerPasswordAction({ volunteerId });
      setIsConfirming(false);
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      setTemporaryPassword(result.data.temporaryPassword);
    });
  }

  async function copy(password: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(password);
      setIsCopied(true);
    } catch (copyError) {
      console.error("[PasswordResetButton] copie impossible", copyError);
    }
  }

  if (temporaryPassword) {
    return (
      <div role="status" className="flex w-full flex-col gap-2 rounded-2xl bg-ok-soft p-4 text-sm text-ok-ink">
        <p>Mot de passe provisoire, à communiquer au bénévole. Il ne sera plus affiché ensuite.</p>
        <div className="flex flex-wrap items-center gap-3">
          <code className="rounded-xl bg-canvas px-3 py-2 font-code text-base text-ink">{temporaryPassword}</code>
          <AdminButton size="sm" onClick={() => copy(temporaryPassword)}>
            {isCopied ? "Copié" : "Copier"}
          </AdminButton>
          <AdminButton size="sm" variant="ghost" onClick={() => setTemporaryPassword(null)}>
            Fermer
          </AdminButton>
        </div>
      </div>
    );
  }

  if (isConfirming) {
    return (
      <span className="inline-flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted">Ses sessions ouvertes seront fermées.</span>
        <AdminButton size="sm" variant="danger" onClick={reset} isLoading={isPending}>
          Réinitialiser
        </AdminButton>
        <AdminButton size="sm" variant="ghost" onClick={() => setIsConfirming(false)} disabled={isPending}>
          Annuler
        </AdminButton>
      </span>
    );
  }

  return (
    <span className="inline-flex flex-col gap-1">
      <AdminButton size="sm" onClick={() => setIsConfirming(true)}>
        Réinitialiser le mot de passe
      </AdminButton>
      {error ? (
        <span role="alert" className="text-xs text-danger-ink">
          {error}
        </span>
      ) : null}
    </span>
  );
}
