import "server-only";

export type RateLimitRule = {
  maxAttempts: number;
  windowMs: number;
};

export type RateLimiter = {
  /// Enregistre une tentative et indique si elle est autorisée.
  tryConsume: (key: string, now?: number) => boolean;
};

type AttemptWindow = {
  count: number;
  resetAt: number;
};

/// Au-delà, les fenêtres expirées sont purgées pour borner la mémoire.
const MAX_TRACKED_KEYS = 10_000;

const UNKNOWN_CLIENT = "unknown";

function purgeExpiredWindows(windows: Map<string, AttemptWindow>, now: number): void {
  for (const [key, window] of windows) {
    if (window.resetAt <= now) windows.delete(key);
  }
}

/// Limiteur à fenêtre fixe, en mémoire. Les Server Actions ne profitent pas du
/// limiteur de Better Auth, réservé à ses propres routes.
///
/// Limite connue : les compteurs vivent dans le processus. Ils repartent de
/// zéro à chaque redémarrage et ne sont pas partagés entre plusieurs
/// instances ; il faudra un stockage partagé (base, Redis) si l'application
/// passe sur plusieurs instances.
export function createRateLimiter(rule: RateLimitRule): RateLimiter {
  const windows = new Map<string, AttemptWindow>();

  return {
    tryConsume(key, now = Date.now()) {
      const current = windows.get(key);
      if (!current || current.resetAt <= now) {
        if (windows.size >= MAX_TRACKED_KEYS) purgeExpiredWindows(windows, now);
        windows.set(key, { count: 1, resetAt: now + rule.windowMs });
        return true;
      }

      current.count += 1;
      return current.count <= rule.maxAttempts;
    },
  };
}

/// Adresse du client, pour clé de limitation.
///
/// On prend la dernière entrée de x-forwarded-for, ajoutée par le proxy le
/// plus proche : les précédentes viennent du client et sont falsifiables. En
/// production, l'application doit donc être derrière un reverse proxy qui
/// complète cet en-tête ; exposé directement, `next start` conserve celui
/// envoyé par le client.
export function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");
  const closestProxyEntry = forwardedFor?.split(",").at(-1)?.trim();
  if (closestProxyEntry) return closestProxyEntry;

  return headers.get("x-real-ip")?.trim() || UNKNOWN_CLIENT;
}
