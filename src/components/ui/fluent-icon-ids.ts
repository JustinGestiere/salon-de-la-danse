/// Les dégradés d'une icône Fluent Color sont des <defs> référencés par id.
/// Deux fois la même icône dans la page donneraient deux fois le même id :
/// si la première est masquée (display: none), la seconde perd ses couleurs.
/// On préfixe donc chaque id, et chaque référence url(#…) ou href="#…".
export function prefixSvgIds(body: string, prefix: string): string {
  return body
    .replace(/\sid="([^"]+)"/g, ` id="${prefix}$1"`)
    .replace(/url\(#([^)]+)\)/g, `url(#${prefix}$1)`)
    .replace(/href="#([^"]+)"/g, `href="#${prefix}$1"`);
}

/// useId() renvoie des caractères interdits dans un id référencé par url(#…).
export function toSvgIdPrefix(reactId: string): string {
  return `fi${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}-`;
}
