export type QueryParams = Record<string, string | undefined>;

/// Construit un lien vers `pathname` en partant des paramètres courants et en
/// appliquant `patch` (undefined ou chaîne vide retire le paramètre). Sert aux
/// filtres, onglets et sélections, dont l'état vit dans l'URL.
export function buildQueryHref(pathname: string, current: QueryParams, patch: QueryParams = {}): string {
  const params = new URLSearchParams();
  const merged: QueryParams = { ...current, ...patch };
  for (const [key, value] of Object.entries(merged)) {
    if (value !== undefined && value !== "") params.set(key, value);
  }
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

/// Réduit les searchParams de Next (valeurs possiblement multiples) à une valeur
/// par clé.
export function toQueryParams(raw: Record<string, string | string[] | undefined>): QueryParams {
  const params: QueryParams = {};
  for (const [key, value] of Object.entries(raw)) {
    params[key] = Array.isArray(value) ? value[0] : value;
  }
  return params;
}
