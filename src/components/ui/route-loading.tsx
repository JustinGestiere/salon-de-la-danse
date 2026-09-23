/// Squelette de chargement générique réutilisé par les loading.tsx des routes.
export function RouteLoading() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Chargement">
      <div className="h-10 w-2/3 animate-pulse rounded-2xl bg-raised" />
      <div className="h-28 animate-pulse rounded-3xl bg-surface" />
      <div className="h-28 animate-pulse rounded-3xl bg-surface" />
    </div>
  );
}
