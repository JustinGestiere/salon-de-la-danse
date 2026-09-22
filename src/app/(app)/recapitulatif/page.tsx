import type { Metadata } from "next";

import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { formatEventDateLong, formatTimeRange } from "@/lib/format";
import { requireVolunteer } from "@/features/auth/guards";
import { getVolunteerSchedule, type ScheduleEntry } from "@/features/volunteers/queries";
import { filterSchedule, parseScheduleFilter } from "@/features/volunteers/filter";
import {
  ScheduleFilterBar,
  type FilterOption,
} from "@/features/volunteers/components/schedule-filter-bar";

export const metadata: Metadata = { title: "Mon récapitulatif — Salon de la Danse" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function readParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function buildMissionOptions(entries: readonly ScheduleEntry[]): FilterOption[] {
  const seen = new Map<string, string>();
  for (const entry of entries) seen.set(entry.missionId, entry.missionName);
  return [...seen.entries()].map(([value, label]) => ({ value, label }));
}

function buildPositionOptions(entries: readonly ScheduleEntry[]): FilterOption[] {
  const seen = new Map<number, string>();
  for (const entry of entries) {
    if (!seen.has(entry.timeSlotPosition)) {
      seen.set(entry.timeSlotPosition, formatTimeRange(entry.startsAt, entry.endsAt));
    }
  }
  return [...seen.entries()]
    .sort(([a], [b]) => a - b)
    .map(([position, label]) => ({ value: String(position), label }));
}

export default async function RecapPage({ searchParams }: { searchParams: SearchParams }) {
  const { volunteer } = await requireVolunteer();
  const schedule = await getVolunteerSchedule(volunteer.id);

  const params = await searchParams;
  const filter = parseScheduleFilter({
    day: readParam(params.day),
    mission: readParam(params.mission),
    position: readParam(params.position),
  });
  const filtered = filterSchedule(schedule, filter);

  const days = [...new Set(schedule.map((entry) => entry.eventDate))];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mon récapitulatif</h1>
        <p className="mt-1 text-sm text-gray-600">
          Badge <span className="font-mono font-semibold">{volunteer.badgeNumber}</span> ·{" "}
          {volunteer.planningStatus === "LOCKED" ? "Planning validé" : "Brouillon"}
        </p>
      </div>

      {schedule.length === 0 ? (
        <Alert tone="info">
          Vous n'avez pas encore réservé de créneau. Rendez-vous sur le planning.
        </Alert>
      ) : (
        <>
          <ScheduleFilterBar
            days={days}
            missions={buildMissionOptions(schedule)}
            positions={buildPositionOptions(schedule)}
          />

          {filtered.length === 0 ? (
            <Alert tone="warning">Aucune mission ne correspond à ces filtres.</Alert>
          ) : (
            <ul className="flex flex-col gap-3">
              {filtered.map((entry) => (
                <li key={entry.assignmentId}>
                  <Card>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900">{entry.missionName}</p>
                        <p className="text-sm capitalize text-gray-600">
                          {formatEventDateLong(entry.eventDate)}
                        </p>
                        <p className="text-sm text-brand-700">
                          {formatTimeRange(entry.startsAt, entry.endsAt)}
                        </p>
                        {entry.missionLocation ? (
                          <p className="text-sm text-gray-500">{entry.missionLocation}</p>
                        ) : null}
                      </div>
                      {entry.isAdminAssigned ? (
                        <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
                          Attribué
                        </span>
                      ) : null}
                    </div>
                    {entry.missionDescription ? (
                      <p className="mt-2 border-t border-gray-100 pt-2 text-sm text-gray-600">
                        <span className="font-medium">Consignes : </span>
                        {entry.missionDescription}
                      </p>
                    ) : null}
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
