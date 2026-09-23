import Form from "next/form";

import { AdminButton } from "@/components/admin/admin-button";
import { ConfirmActionButton } from "@/components/admin/confirm-action-button";
import { ADMIN_INPUT_CLASS } from "@/components/admin/input-styles";
import { StatusPill, type StatusTone } from "@/components/admin/status-pill";
import { formatEventDateLong, formatTimeRange } from "@/lib/format";
import { removeAssignmentAction, setSlotOpenAction } from "@/features/planning/admin-actions";
import { computeHeatLevel, type HeatLevel } from "@/features/planning/admin-grid";
import type { AssignableVolunteer, MissionSlotDetail } from "@/features/planning/admin-queries";
import { AssignVolunteerButton } from "@/features/planning/components/assign-volunteer-button";
import { CapacityEditor } from "@/features/planning/components/capacity-editor";

const HEAT_STATUS: Record<HeatLevel, { tone: StatusTone; label: string }> = {
  low: { tone: "ok", label: "Places disponibles" },
  free: { tone: "ok", label: "Places disponibles" },
  tight: { tone: "warn", label: "Presque complet" },
  full: { tone: "danger", label: "Complet" },
};

type SlotDetailPanelProps = {
  slot: MissionSlotDetail;
  searchQuery: string;
  candidates: readonly AssignableVolunteer[] | null;
};

function describeStatus(slot: MissionSlotDetail): { tone: StatusTone; label: string } {
  const filled = slot.occupants.length;
  if (!slot.isOpen) return { tone: "neutral", label: "Case fermée" };
  if (!slot.isSelfBookable) {
    return filled === 0 ? { tone: "danger", label: "Poste sensible à attribuer" } : { tone: "lilac", label: "Poste sensible" };
  }
  return HEAT_STATUS[computeHeatLevel(filled, slot.capacity)];
}

/// Détail d'une case du conducteur. Les noms des inscrits ne sont visibles que
/// de la régie : côté bénévole, seul le nombre de places restantes s'affiche.
export function SlotDetailPanel({ slot, searchQuery, candidates }: SlotDetailPanelProps) {
  const status = describeStatus(slot);
  const filled = slot.occupants.length;
  const seatCount = Math.max(slot.capacity, filled);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-subtle">
          {formatEventDateLong(slot.eventDate)} · {formatTimeRange(slot.startsAt, slot.endsAt)}
        </p>
        <h2 className="font-display text-4xl leading-none text-ink">{slot.missionName}</h2>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <StatusPill tone={status.tone}>
            {status.label} · {filled}/{slot.capacity}
          </StatusPill>
          {slot.missionLocation ? <span className="text-xs text-subtle">{slot.missionLocation}</span> : null}
        </div>
      </div>

      <ul aria-label="Places du créneau" className="flex flex-wrap gap-2.5">
        {Array.from({ length: seatCount }, (_, index) => {
          const occupant = slot.occupants[index];
          const isOverbooked = index >= slot.capacity;
          if (!occupant) {
            return (
              <li key={index} className="grid size-11 place-items-center rounded-full border border-dashed border-line-strong">
                <span className="sr-only">Place libre</span>
              </li>
            );
          }
          return (
            <li
              key={occupant.assignmentId}
              title={`${occupant.firstName} ${occupant.lastName}`}
              className={`grid size-11 place-items-center rounded-full font-display text-base ${
                isOverbooked ? "border border-danger bg-danger-soft text-danger-ink" : "bg-sunset text-on-accent"
              }`}
            >
              {occupant.firstName.charAt(0)}
              {occupant.lastName.charAt(0)}
            </li>
          );
        })}
      </ul>

      <CapacityEditor key={`${slot.id}-${slot.capacity}`} missionSlotId={slot.id} capacity={slot.capacity} filled={filled} />

      <section aria-labelledby="occupants-title" className="flex flex-col">
        <h3 id="occupants-title" className="mb-1 text-sm font-semibold text-ink">
          Inscrits
        </h3>
        {slot.occupants.length === 0 ? (
          <p className="py-2 font-display text-xl italic text-muted">Scène vide pour l'instant.</p>
        ) : (
          <ul className="flex flex-col">
            {slot.occupants.map((occupant) => (
              <li key={occupant.assignmentId} className="flex items-center gap-3 border-b border-line py-2.5">
                <div className="flex flex-1 flex-col">
                  <span className="text-sm font-medium text-ink">
                    {occupant.firstName} {occupant.lastName}
                  </span>
                  <span className="text-xs text-subtle">
                    {occupant.planningStatus === "LOCKED" ? "Planning validé" : "Brouillon"}
                    {occupant.isAdminAssigned ? " · attribué par la régie" : ""} · {occupant.phone}
                  </span>
                </div>
                <ConfirmActionButton
                  label="Retirer"
                  confirmLabel="Confirmer"
                  action={removeAssignmentAction.bind(null, { assignmentId: occupant.assignmentId })}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="add-volunteer-title" className="flex flex-col gap-3">
        <h3 id="add-volunteer-title" className="text-sm font-semibold text-ink">
          {slot.isSelfBookable ? "Ajouter un bénévole" : "Attribuer ce poste"}
        </h3>
        <Form action="/admin/planning" scroll={false} className="flex gap-2">
          <input type="hidden" name="jour" value={slot.eventDate} />
          <input type="hidden" name="case" value={slot.id} />
          <label htmlFor="slot-search" className="sr-only">
            Rechercher un bénévole
          </label>
          <input
            id="slot-search"
            name="recherche"
            type="search"
            defaultValue={searchQuery}
            placeholder="Nom ou numéro de badge"
            className={`${ADMIN_INPUT_CLASS} rounded-full border-line`}
          />
          <AdminButton type="submit" size="md">
            Chercher
          </AdminButton>
        </Form>
        {candidates === null ? null : candidates.length === 0 ? (
          <p className="text-sm text-subtle">Personne de disponible sur ce créneau ne correspond.</p>
        ) : (
          <ul className="flex flex-col">
            {candidates.map((candidate) => (
              <li key={candidate.volunteerId} className="flex items-center gap-3 border-b border-line py-2.5">
                <span className="flex flex-1 flex-col">
                  <span className="text-sm font-medium text-ink">
                    {candidate.firstName} {candidate.lastName}
                  </span>
                  <span className="text-xs text-subtle">
                    {candidate.badgeNumber} · {candidate.assignmentCount} créneau{candidate.assignmentCount > 1 ? "x" : ""}
                  </span>
                </span>
                <AssignVolunteerButton missionSlotId={slot.id} volunteerId={candidate.volunteerId} label="Ajouter" />
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <p className="max-w-xs text-xs text-subtle">
          Noms visibles par la régie seulement. Les bénévoles ne voient que le nombre de places restantes.
        </p>
        <ConfirmActionButton
          label={slot.isOpen ? "Fermer la case" : "Rouvrir la case"}
          confirmLabel={slot.isOpen ? "Confirmer la fermeture" : "Confirmer la réouverture"}
          variant="secondary"
          action={setSlotOpenAction.bind(null, { missionSlotId: slot.id, isOpen: !slot.isOpen })}
        />
      </div>
    </div>
  );
}
