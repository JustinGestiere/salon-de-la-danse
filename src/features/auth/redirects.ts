// Origine fictive : sert uniquement à vérifier qu'un chemin reste sur le site.
const INTERNAL_ORIGIN = "http://internal.invalid";

/// Le paramètre `suivant` de la connexion vient de l'URL, donc de n'importe
/// qui : suivre une adresse externe ferait de la page de connexion un relais
/// de phishing. Seuls les chemins internes sont suivis, sinon `fallback`.
export function getSafeRedirectPath(requested: string | null, fallback: string): string {
  if (!requested?.startsWith("/")) return fallback;

  // L'analyse par URL déjoue les variantes que le navigateur lirait comme un
  // autre domaine (//hote, /\hote, tabulations ignorées...).
  const url = new URL(requested, INTERNAL_ORIGIN);
  if (url.origin !== INTERNAL_ORIGIN) return fallback;

  return `${url.pathname}${url.search}${url.hash}`;
}
