import type { Metadata } from "next";

import { Alert } from "@/components/ui/alert";
import { Card, CardTitle } from "@/components/ui/card";
import { formatEventDateLong } from "@/lib/format";
import { FillRateBar } from "@/features/admin/components/fill-rate-bar";
import { StatTile } from "@/features/admin/components/stat-tile";
import { requireAdmin } from "@/features/admin/guards";
import { getAdminOverview, getFillRates } from "@/features/admin/queries";
import { getActiveEdition, isRegistrationOpen } from "@/features/editions/queries";

export const metadata: Metadata = {
  title: "Tableau de bord administrateur — Salon de la Danse",
};

export default async function AdminDashboardPage() {
  // Le layout ne suffit pas : il n'est pas réexécuté à chaque navigation et ne
  // bloque pas le rendu de la page (doc Next « Layouts and auth checks »).
  await requireAdmin();
  const edition = await getActiveEdition();

  if (!edition) {
    return (
      <Alert tone="warning">
        Aucune édition active. Créez une édition pour ouvrir les inscriptions.
      </Alert>
    );
  }

  const [overview, fillRates] = await Promise.all([
    getAdminOverview(edition.id),
    getFillRates(edition.id),
  ]);

  const registrationOpen = isRegistrationOpen(edition);
  const globalRate =
    overview.totalCapacity > 0
      ? Math.round((overview.filledSeats / overview.totalCapacity) * 100)
      : 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="mt-1 text-gray-600">{edition.name}</p>
      </div>

      {registrationOpen ? (
        <Alert tone="info">
          Les inscriptions sont <strong>ouvertes</strong>.
        </Alert>
      ) : (
        <Alert tone="warning">
          Les inscriptions sont <strong>fermées</strong>
          {edition.isRegistrationLocked ? " (verrouillage manuel actif)" : ""}. Les
          plannings sont en consultation seule.
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Bénévoles inscrits" value={String(overview.volunteerCount)} />
        <StatTile
          label="Plannings validés"
          value={String(overview.lockedPlanningCount)}
          hint={`${overview.draftPlanningCount} encore en brouillon`}
        />
        <StatTile
          label="Codes d'invitation"
          value={`${overview.invitationUsedCount} / ${overview.invitationCount}`}
          hint="utilisés sur émis"
        />
        <StatTile
          label="Remplissage global"
          value={`${globalRate} %`}
          hint={`${overview.filledSeats} places sur ${overview.totalCapacity}`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>Remplissage par journée</CardTitle>
          {fillRates.byDay.length === 0 ? (
            <p className="text-sm text-gray-500">La grille des créneaux n'est pas encore créée.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {fillRates.byDay.map((day) => (
                <FillRateBar
                  key={day.key}
                  label={formatEventDateLong(day.key)}
                  capacity={day.capacity}
                  filled={day.filled}
                />
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardTitle>Remplissage par mission</CardTitle>
          {fillRates.byMission.length === 0 ? (
            <p className="text-sm text-gray-500">Aucune mission n'est encore définie.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {fillRates.byMission.map((mission) => (
                <FillRateBar
                  key={mission.key}
                  label={mission.label}
                  capacity={mission.capacity}
                  filled={mission.filled}
                />
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
