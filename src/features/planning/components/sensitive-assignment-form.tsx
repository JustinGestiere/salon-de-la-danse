"use client";

import { useState } from "react";

import { AdminSelect } from "@/components/admin/admin-select";
import { AssignVolunteerButton } from "@/features/planning/components/assign-volunteer-button";

export type SensitiveSlotChoice = {
  missionSlotId: string;
  label: string;
};

type SensitiveAssignmentFormProps = {
  volunteerId: string;
  slots: readonly SensitiveSlotChoice[];
};

/// Attribution d'un poste sensible (Billetterie, Caisse) depuis la fiche d'un
/// bénévole : ces cases n'apparaissent pas dans son planning public.
export function SensitiveAssignmentForm({ volunteerId, slots }: SensitiveAssignmentFormProps) {
  const [missionSlotId, setMissionSlotId] = useState(slots[0]?.missionSlotId ?? "");

  if (slots.length === 0) {
    return <p className="text-sm text-subtle">Aucun poste sensible n'est ouvert.</p>;
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="min-w-72 flex-1">
        <AdminSelect
          label="Poste sensible"
          value={missionSlotId}
          onChange={(event) => setMissionSlotId(event.target.value)}
        >
          {slots.map((slot) => (
            <option key={slot.missionSlotId} value={slot.missionSlotId}>
              {slot.label}
            </option>
          ))}
        </AdminSelect>
      </div>
      <AssignVolunteerButton
        key={missionSlotId}
        missionSlotId={missionSlotId}
        volunteerId={volunteerId}
        label="Attribuer"
        variant="primary"
      />
    </div>
  );
}
