import { Container } from "@/components/ui/container";

/// Squelette de chargement générique réutilisé par les loading.tsx des routes.
export function RouteLoading() {
  return (
    <Container className="flex flex-col gap-6 py-20" >
      <div aria-busy="true" aria-label="Chargement" className="flex flex-col gap-6">
        <div className="h-16 w-2/3 animate-pulse rounded-3xl bg-raised" />
        <div className="h-40 animate-pulse rounded-[28px] bg-surface" />
        <div className="h-40 animate-pulse rounded-[28px] bg-surface" />
      </div>
    </Container>
  );
}
