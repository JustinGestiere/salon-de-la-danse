import type { Metadata } from "next";

import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
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
    <div className="flex flex-col gap-6">
      <PageHeader
        kicker="Mon récapitulatif"
        title="Vos missions"
        emphasis="du Salon"
        description={
          <>
            Badge <span className="font-code text-ink">{volunteer.badgeNumber}</span> ·{" "}
            {volunteer.planningStatus === "LOCKED" ? "Planning validé" : "Brouillon"}
          </>
        }
      />

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
                        <p className="font-display text-2xl leading-tight text-ink">{entry.missionName}</p>
                        <p className="mt-1 text-sm capitalize text-ink-soft">
                          {formatEventDateLong(entry.eventDate)}
                        </p>
                        <p className="font-code text-sm text-accent">
                          {formatTimeRange(entry.startsAt, entry.endsAt)}
                        </p>
                        {entry.missionLocation ? (
                          <p className="text-sm text-muted">{entry.missionLocation}</p>
                        ) : null}
                      </div>
                      {entry.isAdminAssigned ? (
                        <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-lilac-soft px-2.5 py-1 text-xs font-medium text-lilac-ink">
                          <span aria-hidden="true" className="size-1.5 rounded-full bg-lilac" />
                          Attribué
                        </span>
                      ) : null}
                    </div>
                    {entry.missionDescription ? (
                      <p className="mt-4 border-t border-line pt-3 text-sm text-muted">
                        <span className="font-medium text-ink-soft">Consignes : </span>
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
