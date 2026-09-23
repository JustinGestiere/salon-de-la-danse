import type { UserRole } from "@/generated/prisma/enums";

/// Page d'entrée : elle renvoie chaque utilisateur vers l'espace de son rôle.
export const ENTRY_PATH = "/";
export const LOGIN_PATH = "/connexion";
export const VOLUNTEER_HOME_PATH = "/tableau-de-bord";
export const ADMIN_HOME_PATH = "/admin/tableau-de-bord";

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

/// Espace d'accueil d'un utilisateur connecté. Un administrateur n'a pas de
/// participation bénévole : l'envoyer sur le tableau de bord bénévole le
/// renverrait vers la connexion alors qu'il est déjà connecté.
export function getHomePath(role: UserRole): string {
  return role === "ADMIN" ? ADMIN_HOME_PATH : VOLUNTEER_HOME_PATH;
}
