import { formatEventDateShort, formatTimeRange } from "@/lib/format";
import type { PlanningDay } from "@/features/planning/queries";
import type { VolunteerAssignment } from "@/features/volunteers/admin-queries";

type VolunteerWeekGridProps = {
  days: readonly PlanningDay[];
  assignments: readonly VolunteerAssignment[];
};

/// Le week-end d'un bénévole en un coup d'œil : les enchaînements et les trous
/// se voient mieux que dans une liste.
export function VolunteerWeekGrid({ days, assignments }: VolunteerWeekGridProps) {
  const byTimeSlot = new Map(assignments.map((assignment) => [assignment.timeSlotId, assignment]));
  const slotCount = Math.max(0, ...days.map((day) => day.timeSlots.length));

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] table-fixed border-separate border-spacing-1.5 text-left">
        <caption className="sr-only">Créneaux du bénévole, jour par jour</caption>
        <thead>
          <tr>
            <th scope="col" className="w-28" />
            {(days[0]?.timeSlots ?? []).slice(0, slotCount).map((timeSlot) => (
              <th key={timeSlot.id} scope="col" className="font-code text-[11px] font-normal text-subtle">
                {formatTimeRange(timeSlot.startsAt, timeSlot.endsAt)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {days.map((day) => (
            <tr key={day.eventDate}>
              <th scope="row" className="whitespace-nowrap font-display text-lg font-normal capitalize text-ink">
                {formatEventDateShort(day.eventDate)}
              </th>
              {day.timeSlots.map((timeSlot) => {
                const assignment = byTimeSlot.get(timeSlot.id);
                if (!assignment) {
                  return (
                    <td key={timeSlot.id} className="h-12 rounded-xl border border-dashed border-line">
                      <span className="sr-only">Libre</span>
                    </td>
                  );
                }
                return (
                  <td
                    key={timeSlot.id}
                    className={`h-12 rounded-xl border px-2.5 text-xs font-medium ${
                      assignment.isSensitive
                        ? "border-lilac/50 bg-lilac-soft text-lilac-ink"
                        : "border-accent/40 bg-raised text-accent-strong"
                    }`}
                  >
                    {assignment.missionName}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
