import type { Metadata } from "next";

import { Alert } from "@/components/ui/alert";
import { requireVolunteer } from "@/features/auth/guards";
import { isRegistrationOpen } from "@/features/editions/queries";
import { getPlanningView } from "@/features/planning/queries";
import {
  PlanningBoard,
  type BoardCell,
  type BoardDay,
} from "@/features/planning/components/planning-board";

export const metadata: Metadata = { title: "Planning — Salon de la Danse" };

export default async function PlanningPage() {
  const { edition, volunteer } = await requireVolunteer();
  const view = await getPlanningView(edition.id, volunteer.id);

  const editable =
    isRegistrationOpen(edition) && volunteer.planningStatus === "DRAFT";

  const days: BoardDay[] = view.days.map((day) => ({
    eventDate: day.eventDate,
    timeSlots: day.timeSlots.map((slot) => ({
      id: slot.id,
      position: slot.position,
      startsAtIso: slot.startsAt.toISOString(),
      endsAtIso: slot.endsAt.toISOString(),
    })),
  }));

  const cells: BoardCell[] = Object.values(view.cells).map((cell) => ({
    missionSlotId: cell.missionSlotId,
    missionId: cell.missionId,
    timeSlotId: cell.timeSlotId,
    capacity: cell.capacity,
    remaining: cell.remaining,
    gauge: cell.gauge,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Composez votre planning</h1>
        <p className="mt-1 text-sm text-gray-600">
          Touchez une mission pour la réserver. Vert : places disponibles, orange : bientôt
          complet, gris : complet.
        </p>
      </div>

      {view.days.length === 0 ? (
        <Alert tone="info">La grille des créneaux n'est pas encore publiée.</Alert>
      ) : (
        <PlanningBoard
          days={days}
          missions={view.missions.map((m) => ({ id: m.id, name: m.name, location: m.location }))}
          cells={cells}
          initialSelected={view.selectedMissionSlotIds}
          rules={{
            minSlots: edition.minSlotsPerVolunteer,
            maxSlots: edition.maxSlotsPerVolunteer,
            maxConsecutive: edition.maxConsecutiveSlots,
          }}
          editable={editable}
        />
      )}
    </div>
  );
}
