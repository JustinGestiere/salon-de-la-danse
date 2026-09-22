/// Squelette de chargement générique réutilisé par les loading.tsx des routes.
export function RouteLoading() {
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-label="Chargement">
      <div className="h-8 w-2/3 animate-pulse rounded bg-gray-200" />
      <div className="h-24 animate-pulse rounded-xl bg-gray-100" />
      <div className="h-24 animate-pulse rounded-xl bg-gray-100" />
    </div>
  );
}
