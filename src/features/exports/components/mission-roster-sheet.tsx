import { formatEventDateShort, formatTimeRange } from "@/lib/format";
import type { MissionRoster } from "@/features/exports/roster-queries";
import { utcToZonedLocalInput } from "@/features/editions/dates";

/// Une mission par page : la feuille que le responsable de poste garde sur lui.
export function MissionRosterSheet({ roster }: { roster: MissionRoster }) {
  return (
    <section aria-labelledby={`roster-${roster.missionId}`} className="flex break-after-page flex-col gap-4 py-6 last:break-after-auto">
      <header className="flex items-baseline justify-between gap-4 border-b-2 border-ink pb-2">
        <h2 id={`roster-${roster.missionId}`} className="font-display text-[22pt] leading-none">
          {roster.name}
        </h2>
        <span className="text-[9pt] text-muted">
          {roster.location ?? ""}
          {roster.isSelfBookable ? "" : " · poste attribué par la régie"}
        </span>
      </header>
      {roster.slots.map((slot) => (
        <div key={slot.missionSlotId} className="break-inside-avoid">
          <h3 className="flex justify-between border-b border-line-strong py-1.5 text-[10pt] font-semibold">
            <span>
              {formatEventDateShort(utcToZonedLocalInput(slot.startsAt).slice(0, 10))} · {formatTimeRange(slot.startsAt, slot.endsAt)}
            </span>
            <span className="font-normal text-muted">
              {slot.volunteers.length} / {slot.capacity}
            </span>
          </h3>
          {slot.volunteers.length === 0 ? (
            <p className="py-1.5 text-[9pt] italic text-muted">Personne pour l'instant.</p>
          ) : (
            <table className="w-full table-fixed text-[9pt]">
              <tbody>
                {slot.volunteers.map((volunteer) => (
                  <tr key={volunteer.assignmentId} className="border-b border-line">
                    <td className="w-[8mm] py-1">
                      <span aria-hidden="true" className="inline-block size-[3.5mm] border border-ink-soft" />
                    </td>
                    <td className="w-[45%] py-1">{volunteer.fullName}</td>
                    <td className="w-[20%] py-1 font-code">{volunteer.badgeNumber}</td>
                    <td className="w-[20%] py-1">{volunteer.phone}</td>
                    <td className="py-1 text-right text-muted">{volunteer.isAdminAssigned ? "Régie" : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </section>
  );
}
