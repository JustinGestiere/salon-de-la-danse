import Image from "next/image";

import { AdminAlert } from "@/components/admin/admin-alert";
import { AdminButtonLink } from "@/components/admin/admin-button";
import { ConfirmActionButton } from "@/components/admin/confirm-action-button";
import { StatusPill } from "@/components/admin/status-pill";
import { formatDate, formatDateTime, formatEventDateShort, formatTimeRange } from "@/lib/format";
import { removeAssignmentAction } from "@/features/planning/admin-actions";
import {
  SensitiveAssignmentForm,
  type SensitiveSlotChoice,
} from "@/features/planning/components/sensitive-assignment-form";
import type { PlanningDay } from "@/features/planning/queries";
import { validateSelection, type SlotRules } from "@/features/planning/rules";
import { approveMinorAction, setPlanningLockAction } from "@/features/volunteers/admin-actions";
import type { VolunteerDetail as VolunteerDetailData } from "@/features/volunteers/admin-queries";
import { PasswordResetButton } from "@/features/volunteers/components/password-reset-button";
import { ProfileEditForm } from "@/features/volunteers/components/profile-edit-form";
import { RuleChecks } from "@/features/volunteers/components/rule-checks";
import { VOLUNTEER_STATUS_TONES } from "@/features/volunteers/components/status-display";
import { VolunteerWeekGrid } from "@/features/volunteers/components/volunteer-week-grid";
import { VOLUNTEER_STATUS_LABELS, deriveVolunteerStatus } from "@/features/volunteers/status";

type VolunteerDetailProps = {
  volunteer: VolunteerDetailData;
  days: readonly PlanningDay[];
  rules: SlotRules;
  isMinorPending: boolean;
  sensitiveSlots: readonly SensitiveSlotChoice[];
};

function describeLock(volunteer: VolunteerDetailData): string {
  if (volunteer.planningStatus === "LOCKED") {
    return volunteer.lockedAt
      ? `Validé définitivement le ${formatDateTime(volunteer.lockedAt)} · verrouillé`
      : "Validé définitivement · verrouillé";
  }
  return volunteer.assignments.length > 0
    ? "Brouillon : le bénévole n'a pas encore validé."
    : "Aucun créneau choisi pour l'instant.";
}

export function VolunteerDetail({ volunteer, days, rules, isMinorPending, sensitiveSlots }: VolunteerDetailProps) {
  const status = deriveVolunteerStatus(volunteer.planningStatus, volunteer.assignments.length);
  const isLocked = volunteer.planningStatus === "LOCKED";
  const violations = validateSelection(
    volunteer.assignments.map((assignment) => ({
      missionSlotId: assignment.missionSlotId,
      timeSlotId: assignment.timeSlotId,
      eventDate: assignment.eventDate,
      position: assignment.position,
    })),
    rules,
  );

  return (
    <article aria-labelledby="volunteer-name" className="flex flex-col gap-7">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-start">
        {volunteer.hasPhoto ? (
          <Image
            src={`/api/admin/volunteers/${volunteer.id}/photo`}
            alt={`Photo de ${volunteer.firstName} ${volunteer.lastName}`}
            width={128}
            height={156}
            unoptimized
            className="h-[156px] w-32 shrink-0 rounded-3xl object-cover"
          />
        ) : (
          <div className="grid h-[156px] w-32 shrink-0 place-items-center rounded-3xl border border-dashed border-line-strong text-center text-xs text-subtle">
            <span>
              <span className="block font-display text-4xl text-muted">
                {volunteer.firstName.charAt(0)}
                {volunteer.lastName.charAt(0)}
              </span>
              Photo manquante
            </span>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-code text-xs text-subtle">{volunteer.badgeNumber}</span>
            <StatusPill tone={VOLUNTEER_STATUS_TONES[status]}>{VOLUNTEER_STATUS_LABELS[status]}</StatusPill>
            {isMinorPending ? <StatusPill tone="danger">Mineur à valider</StatusPill> : null}
          </div>
          <h2 id="volunteer-name" className="font-display text-5xl leading-[0.95] text-ink">
            {volunteer.firstName} <em className="text-accent-strong">{volunteer.lastName}</em>
          </h2>
          <p className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted">
            <a href={`mailto:${volunteer.email}`} className="hover:text-ink">
              {volunteer.email}
            </a>
            <a href={`tel:${volunteer.phone.replace(/\s/g, "")}`} className="hover:text-ink">
              {volunteer.phone}
            </a>
            {volunteer.birthDate ? <span>Né·e le {formatDate(volunteer.birthDate)}</span> : null}
          </p>
          <div className="flex flex-wrap items-start gap-2 pt-1">
            <ProfileEditForm
              initialValues={{
                volunteerId: volunteer.id,
                firstName: volunteer.firstName,
                lastName: volunteer.lastName,
                email: volunteer.email,
                phone: volunteer.phone,
                birthDate: volunteer.birthDate ? volunteer.birthDate.toISOString().slice(0, 10) : "",
              }}
            />
            <PasswordResetButton volunteerId={volunteer.id} />
            <AdminButtonLink href={`/admin/impression/badges?benevole=${volunteer.id}`} size="sm" target="_blank">
              Imprimer le badge
            </AdminButtonLink>
          </div>
        </div>
      </header>

      <p className="rounded-2xl bg-raised px-4 py-3 text-sm text-muted">
        Nom, e-mail et photo sont verrouillés côté bénévole : seule la régie peut les modifier. Inscrit·e le{" "}
        {formatDate(volunteer.createdAt)}
        {volunteer.invitationCode ? ` avec le code ${volunteer.invitationCode}` : ""}.
      </p>

      {isMinorPending ? (
        <AdminAlert tone="warning">
          <span className="flex flex-wrap items-center justify-between gap-3">
            Ce bénévole sera mineur pendant le salon : sa participation doit être validée par la régie.
            <ConfirmActionButton
              label="Valider la participation"
              confirmLabel="Confirmer la validation"
              variant="secondary"
              action={approveMinorAction.bind(null, { volunteerId: volunteer.id })}
            />
          </span>
        </AdminAlert>
      ) : null}

      <section aria-labelledby="volunteer-planning-title" className="flex flex-col gap-5 border-t border-line pt-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h3 id="volunteer-planning-title" className="font-display text-3xl text-ink">
              Son planning
            </h3>
            <p className="text-sm text-subtle">{describeLock(volunteer)}</p>
          </div>
          <ConfirmActionButton
            label={isLocked ? "Déverrouiller" : "Verrouiller"}
            confirmLabel={isLocked ? "Rouvrir le planning" : "Verrouiller le planning"}
            variant="secondary"
            action={setPlanningLockAction.bind(null, { volunteerId: volunteer.id, isLocked: !isLocked })}
          />
        </div>

        <VolunteerWeekGrid days={days} assignments={volunteer.assignments} />
        <RuleChecks slotCount={volunteer.assignments.length} rules={rules} violations={violations} />

        {volunteer.assignments.length > 0 ? (
          <ul aria-label="Affectations" className="flex flex-col">
            {volunteer.assignments.map((assignment) => (
              <li key={assignment.assignmentId} className="flex flex-wrap items-center gap-3 border-b border-line py-3">
                <span className="w-44 text-sm capitalize text-muted">
                  {formatEventDateShort(assignment.eventDate)} · {formatTimeRange(assignment.startsAt, assignment.endsAt)}
                </span>
                <span className="flex-1 text-sm font-medium text-ink">
                  {assignment.missionName}
                  {assignment.isAdminAssigned ? <span className="ml-2 text-xs text-lilac-ink">attribué par la régie</span> : null}
                </span>
                <ConfirmActionButton
                  label="Retirer"
                  confirmLabel="Confirmer le retrait"
                  action={removeAssignmentAction.bind(null, { assignmentId: assignment.assignmentId })}
                />
              </li>
            ))}
          </ul>
        ) : null}

        <div className="flex flex-col gap-3 rounded-3xl border border-line p-5">
          <h4 className="text-sm font-semibold text-ink">Attribuer un poste sensible</h4>
          <SensitiveAssignmentForm volunteerId={volunteer.id} slots={sensitiveSlots} />
        </div>

        <p className="text-xs text-subtle">
          Toute modification faite ici passe outre le verrouillage du bénévole et s'inscrit au journal.
        </p>
      </section>
    </article>
  );
}
