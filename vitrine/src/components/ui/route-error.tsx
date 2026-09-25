"use client";

import { useEffect } from "react";

import { Container } from "@/components/ui/container";

type RouteErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/// Contenu générique d'une frontière d'erreur de route. On logue le détail et
/// on n'affiche au visiteur qu'un message générique.
export function RouteError({ error, reset }: RouteErrorProps) {
  useEffect(() => {
    console.error("[route-error]", error);
  }, [error]);

  return (
    <Container className="flex flex-col items-start gap-6 py-24">
      <p role="alert" className="font-display text-4xl text-ink">
        Cette page n'a pas pu s'afficher.
      </p>
      <button
        type="button"
        onClick={reset}
        className="inline-flex min-h-12 items-center rounded-full border border-line-strong px-6 text-ink hover:bg-raised"
      >
        Réessayer
      </button>
    </Container>
  );
}
