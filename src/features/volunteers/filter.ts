import type { ScheduleEntry } from "@/features/volunteers/queries";

export type ScheduleFilter = {
  /// Jour ISO (AAAA-MM-JJ), ou null pour tous les jours.
  day: string | null;
  missionId: string | null;
  /// Rang du créneau (1..n), ou null pour tous les créneaux.
  position: number | null;
};

/// Filtre pur du récapitulatif, partagé par l'écran et l'export imprimable, pour
/// éviter d'imprimer tout le planning d'un coup.
export function filterSchedule(
  entries: readonly ScheduleEntry[],
  filter: ScheduleFilter,
): ScheduleEntry[] {
  return entries.filter((entry) => {
    if (filter.day && entry.eventDate !== filter.day) return false;
    if (filter.missionId && entry.missionId !== filter.missionId) return false;
    if (filter.position !== null && entry.timeSlotPosition !== filter.position) return false;
    return true;
  });
}

/// Construit un filtre à partir de paramètres d'URL bruts.
export function parseScheduleFilter(params: {
  day?: string;
  mission?: string;
  position?: string;
}): ScheduleFilter {
  const parsedPosition = params.position ? Number.parseInt(params.position, 10) : Number.NaN;
  return {
    day: params.day && params.day.length > 0 ? params.day : null,
    missionId: params.mission && params.mission.length > 0 ? params.mission : null,
    position: Number.isInteger(parsedPosition) ? parsedPosition : null,
  };
}
