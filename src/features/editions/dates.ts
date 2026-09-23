import { EVENT_TIME_ZONE } from "@/lib/format";

const MS_PER_MINUTE = 60_000;
const MS_PER_DAY = 86_400_000;

function readZonedParts(date: Date, timeZone: string): Record<string, number> {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);
  const values: Record<string, number> = {};
  for (const part of parts) {
    if (part.type !== "literal") values[part.type] = Number(part.value);
  }
  return values;
}

/// Décalage (en minutes) du fuseau par rapport à UTC à un instant donné. Tient
/// compte de l'heure d'été.
function getTimeZoneOffsetMinutes(date: Date, timeZone: string): number {
  const parts = readZonedParts(date, timeZone);
  const asUtc = Date.UTC(
    parts.year ?? 0,
    (parts.month ?? 1) - 1,
    parts.day ?? 1,
    parts.hour ?? 0,
    parts.minute ?? 0,
    parts.second ?? 0,
  );
  return Math.round((asUtc - date.getTime()) / MS_PER_MINUTE);
}

/// Convertit une saisie « AAAA-MM-JJTHH:mm » faite à l'heure du salon en instant
/// UTC, forme de stockage de toutes les dates.
export function zonedLocalToUtc(localValue: string, timeZone: string = EVENT_TIME_ZONE): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(localValue);
  if (!match) throw new Error(`Date locale invalide : ${localValue}`);
  const [, year, month, day, hour, minute] = match.map(Number);
  const guess = Date.UTC(year ?? 0, (month ?? 1) - 1, day ?? 1, hour ?? 0, minute ?? 0);
  const offset = getTimeZoneOffsetMinutes(new Date(guess), timeZone);
  return new Date(guess - offset * MS_PER_MINUTE);
}

/// Inverse de zonedLocalToUtc : valeur prête pour un champ datetime-local.
export function utcToZonedLocalInput(date: Date, timeZone: string = EVENT_TIME_ZONE): string {
  const parts = readZonedParts(date, timeZone);
  const pad = (value: number | undefined): string => String(value ?? 0).padStart(2, "0");
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}T${pad(parts.hour)}:${pad(parts.minute)}`;
}

/// Heure locale « HH:mm » d'un instant, à l'heure du salon.
export function toZonedTimeOfDay(date: Date, timeZone: string = EVENT_TIME_ZONE): string {
  return utcToZonedLocalInput(date, timeZone).slice(11);
}

/// Nombre de jours entre deux dates ISO courtes (AAAA-MM-JJ).
export function daysBetween(fromIsoDate: string, toIsoDate: string): number {
  const from = Date.parse(`${fromIsoDate}T00:00:00Z`);
  const to = Date.parse(`${toIsoDate}T00:00:00Z`);
  return Math.round((to - from) / MS_PER_DAY);
}

export function addDaysToIsoDate(isoDate: string, days: number): string {
  return new Date(Date.parse(`${isoDate}T00:00:00Z`) + days * MS_PER_DAY).toISOString().slice(0, 10);
}
