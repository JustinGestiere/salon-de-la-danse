import { StatusPill } from "@/components/admin/status-pill";
import { formatEventDateShort, formatTimeRange } from "@/lib/format";
import { utcToZonedLocalInput } from "@/features/editions/dates";
import type { BadgeVerification } from "@/features/badges/queries";
import { VolunteerPhoto } from "@/features/badges/components/volunteer-photo";

type VerificationCardProps = {
  verification: BadgeVerification;
  editionName: string;
  today: string;
};

function toEventDay(date: Date): string {
  return utcToZonedLocalInput(date).slice(0, 10);
}

/// Ce que l'accueil voit en scannant un badge : l'identité à comparer avec la
/// personne en face, et où elle est attendue aujourd'hui.
export function VerificationCard({ verification, editionName, today }: VerificationCardProps) {
  const fullName = `${verification.firstName} ${verification.lastName}`;
  const isLocked = verification.planningStatus === "LOCKED";
  const todayAssignments = verification.assignments.filter((assignment) => toEventDay(assignment.startsAt) === today);
  const shownAssignments = todayAssignments.length > 0 ? todayAssignments : verification.assignments;

  return (
    <article className="mx-auto flex w-full max-w-sm flex-col items-center gap-3 rounded-[34px] border border-line bg-surface px-6 pb-6 pt-8 text-center">
      <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-subtle">Vérification</span>
      <div className="relative h-40 w-32 overflow-hidden rounded-2xl bg-raised">
        {verification.hasPhoto ? (
          <VolunteerPhoto volunteerId={verification.id} fullName={fullName} sizes="128px" />
        ) : (
          <span className="grid h-full place-items-center text-xs text-danger-ink">Photo manquante</span>
        )}
      </div>
      <h1 className="font-display text-3xl leading-tight text-ink">
        {verification.firstName} <em>{verification.lastName}</em>
      </h1>
      <span className="font-code text-xs text-subtle">{verification.badgeNumber}</span>
      <StatusPill tone={isLocked ? "ok" : "warn"}>
        Bénévole · {editionName} · {isLocked ? "planning validé" : "planning en brouillon"}
      </StatusPill>
      <div className="mt-2 flex w-full flex-col gap-1.5 border-t border-line pt-4 text-sm text-ink-soft">
        <span className="text-xs font-medium uppercase tracking-[0.16em] text-subtle">
          {todayAssignments.length > 0 ? "Attendu aujourd'hui" : "Ses créneaux"}
        </span>
        {shownAssignments.length === 0 ? <span className="text-muted">Aucun créneau.</span> : null}
        {shownAssignments.map((assignment) => (
          <span key={assignment.id}>
            {todayAssignments.length > 0 ? "" : `${formatEventDateShort(toEventDay(assignment.startsAt))} · `}
            {assignment.missionName}, {formatTimeRange(assignment.startsAt, assignment.endsAt)}
            {assignment.location ? <span className="text-subtle"> ({assignment.location})</span> : null}
          </span>
        ))}
      </div>
    </article>
  );
}
