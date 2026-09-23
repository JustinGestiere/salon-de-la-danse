// Les dates sont stockées en UTC et converties uniquement à l'affichage, dans
// le fuseau de l'évènement.
export const EVENT_TIME_ZONE = "Europe/Paris";

export function formatEventDateLong(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00Z`);
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: EVENT_TIME_ZONE,
  }).format(date);
}

export function formatEventDateShort(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00Z`);
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: EVENT_TIME_ZONE,
  }).format(date);
}

export function formatTimeRange(startsAt: Date, endsAt: Date): string {
  const formatter = new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: EVENT_TIME_ZONE,
  });
  return `${formatter.format(startsAt)} – ${formatter.format(endsAt)}`;
}

/// Horodatage de gestion (journal, fiches) : « 14 mai 2027 à 18:30 ».
export function formatDateTime(value: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: EVENT_TIME_ZONE,
  }).format(value);
}

export function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: EVENT_TIME_ZONE,
  }).format(value);
}

/// Mois et année, par exemple « mai 2027 » (badges).
export function formatMonthYear(value: Date): string {
  return new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric", timeZone: EVENT_TIME_ZONE }).format(value);
}
