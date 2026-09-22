import type { Metadata } from "next";

import { formatEventDateLong, formatTimeRange } from "@/lib/format";
import { requireVolunteer } from "@/features/auth/guards";
import { getVolunteerSchedule } from "@/features/volunteers/queries";
import { filterSchedule, parseScheduleFilter } from "@/features/volunteers/filter";
import { AutoPrint } from "@/features/volunteers/components/auto-print";

export const metadata: Metadata = { title: "Planning bénévole — impression" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function readParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PrintSchedulePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { user, edition, volunteer } = await requireVolunteer();
  const schedule = await getVolunteerSchedule(volunteer.id);

  const params = await searchParams;
  const filtered = filterSchedule(
    schedule,
    parseScheduleFilter({
      day: readParam(params.day),
      mission: readParam(params.mission),
      position: readParam(params.position),
    }),
  );

  return (
    <div>
      <AutoPrint />

      <header className="mb-4 border-b border-gray-300 pb-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
          {edition.name}
        </p>
        <h1 className="text-xl font-bold text-gray-900">Planning bénévole</h1>
        <p className="text-sm text-gray-700">
          {user.firstName} {user.lastName} · Badge {volunteer.badgeNumber}
        </p>
      </header>

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-600">Aucune mission pour ces filtres.</p>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-300 text-left">
              <th className="py-2 pr-2">Jour</th>
              <th className="py-2 pr-2">Horaire</th>
              <th className="py-2 pr-2">Mission</th>
              <th className="py-2">Lieu</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((entry) => (
              <tr key={entry.assignmentId} className="border-b border-gray-200 align-top">
                <td className="py-2 pr-2 capitalize">{formatEventDateLong(entry.eventDate)}</td>
                <td className="py-2 pr-2 whitespace-nowrap">
                  {formatTimeRange(entry.startsAt, entry.endsAt)}
                </td>
                <td className="py-2 pr-2 font-medium">{entry.missionName}</td>
                <td className="py-2">{entry.missionLocation ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p className="mt-6 text-xs text-gray-500">
        Document généré depuis l'espace bénévole du Salon de la Danse.
      </p>
    </div>
  );
}
