"use client";

import { useEffect } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

/// Contenu générique d'une frontière d'erreur de route. On logue le détail et
/// on n'affiche à l'utilisateur qu'un message générique.
export function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[route-error]", error);
  }, [error]);

  return (
    <div className="flex flex-col gap-4">
      <Alert tone="error">
        Une erreur est survenue lors du chargement de cette page.
      </Alert>
      <Button variant="secondary" onClick={reset} className="self-start">
        Réessayer
      </Button>
    </div>
  );
}
