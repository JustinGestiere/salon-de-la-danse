/// Squelette de chargement des pages du back-office.
export function AdminRouteLoading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Chargement">
      <div className="h-12 w-1/3 animate-pulse rounded-2xl bg-raised" />
      <div className="h-40 animate-pulse rounded-3xl bg-surface" />
      <div className="h-64 animate-pulse rounded-3xl bg-surface" />
    </div>
  );
}
