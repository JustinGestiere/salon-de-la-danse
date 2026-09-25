import { EVENT_TIME_ZONE } from "@/lib/format";

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

/// Date du jour à Angers (AAAA-MM-JJ), quel que soit le fuseau du serveur.
function toEventIsoDate(value: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: EVENT_TIME_ZONE }).format(value);
}

/// Nombre de jours avant la date cible, comptés en jours calendaires à Angers.
/// Jamais négatif : une fois la date passée, le compte reste à 0.
export function getDaysUntil(targetIsoDate: string, now: Date): number {
  const today = Date.parse(`${toEventIsoDate(now)}T00:00:00Z`);
  const target = Date.parse(`${targetIsoDate}T00:00:00Z`);
  return Math.max(0, Math.round((target - today) / MILLISECONDS_PER_DAY));
}
