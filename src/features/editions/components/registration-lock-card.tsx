"use client";

import { useOptimistic, useState, useTransition } from "react";

import { setRegistrationLockAction } from "@/features/editions/admin-actions";

/// Verrouillage manuel des inscriptions : « rideau baissé », tous les plannings
/// passent en consultation seule, même dans la fenêtre d'inscription.
export function RegistrationLockCard({ isLocked }: { isLocked: boolean }) {
  const [optimisticLocked, setOptimisticLocked] = useOptimistic(isLocked);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggle(): void {
    setError(null);
    const next = !optimisticLocked;
    startTransition(async () => {
      setOptimisticLocked(next);
      const result = await setRegistrationLockAction({ isLocked: next });
      if (!result.ok) setError(result.error.message);
    });
  }

  return (
    <section
      aria-labelledby="lock-title"
      className={`flex items-center gap-6 rounded-3xl border p-7 transition ${
        optimisticLocked ? "border-accent/50 bg-[linear-gradient(110deg,var(--admin-glow),transparent)]" : "border-line bg-surface"
      }`}
    >
      <div className="flex flex-1 flex-col gap-1.5">
        <h2 id="lock-title" className={`font-display text-3xl ${optimisticLocked ? "text-accent-strong" : "text-ink"}`}>
          {optimisticLocked ? "Rideau baissé" : "Verrouillage manuel"}
        </h2>
        <p className="text-sm leading-relaxed text-muted">
          {optimisticLocked
            ? "Inscriptions verrouillées : tous les plannings sont en consultation seule, même dans la fenêtre d'inscription."
            : "Coupe les inscriptions à tout moment, sans attendre la date de fermeture."}
        </p>
        {error ? (
          <p role="alert" className="text-xs text-danger-ink">
            {error}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={optimisticLocked}
        aria-label="Verrouiller toutes les inscriptions"
        onClick={toggle}
        disabled={isPending}
        className={`flex h-9 w-16 shrink-0 items-center rounded-full p-1 transition ${
          optimisticLocked ? "bg-sunset justify-end" : "justify-start bg-line-strong"
        }`}
      >
        <span className="size-7 rounded-full bg-white shadow" />
      </button>
    </section>
  );
}
