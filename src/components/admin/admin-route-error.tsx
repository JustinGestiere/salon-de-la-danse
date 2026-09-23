"use client";

import { useEffect } from "react";

import { AdminAlert } from "@/components/admin/admin-alert";
import { AdminButton } from "@/components/admin/admin-button";

/// Frontière d'erreur des pages du back-office : détail loggé, message générique
/// affiché.
export function AdminRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin-route-error]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-start gap-4">
      <AdminAlert tone="error">Une erreur est survenue lors du chargement de cette page.</AdminAlert>
      <AdminButton onClick={reset}>Réessayer</AdminButton>
    </div>
  );
}
