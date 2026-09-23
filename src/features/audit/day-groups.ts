import { utcToZonedLocalInput } from "@/features/editions/dates";

export type DayGroup<TItem> = {
  /// Date du jour à l'heure du salon, AAAA-MM-JJ.
  day: string;
  label: string;
  items: TItem[];
};

const MS_PER_DAY = 86_400_000;

function toEventDay(date: Date): string {
  return utcToZonedLocalInput(date).slice(0, 10);
}

function labelDay(day: string, today: string, yesterday: string): string {
  if (day === today) return "Aujourd'hui";
  if (day === yesterday) return "Hier";
  return new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(
    new Date(`${day}T12:00:00Z`),
  );
}

/// Regroupe des éléments déjà triés du plus récent au plus ancien par jour
/// (heure de Paris), pour le journal.
export function groupByEventDay<TItem extends { createdAt: Date }>(items: readonly TItem[], now: Date): DayGroup<TItem>[] {
  const today = toEventDay(now);
  const yesterday = toEventDay(new Date(now.getTime() - MS_PER_DAY));
  const groups: DayGroup<TItem>[] = [];

  for (const item of items) {
    const day = toEventDay(item.createdAt);
    const last = groups.at(-1);
    if (last && last.day === day) {
      last.items.push(item);
      continue;
    }
    groups.push({ day, label: labelDay(day, today, yesterday), items: [item] });
  }
  return groups;
}
