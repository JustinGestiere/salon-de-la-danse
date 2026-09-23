import { AdminButtonLink } from "@/components/admin/admin-button";
import { EmptyState } from "@/components/admin/empty-state";
import { listMissionSettings } from "@/features/editions/admin-queries";
import { CreateMissionForm } from "@/features/editions/components/create-mission-form";
import { MissionSettingsRow } from "@/features/editions/components/mission-settings-row";

/// Onglet « Missions et jauges » : accès libre ou réservé, jauge par mission.
export async function MissionSettings({ editionId }: { editionId: string }) {
  const missions = await listMissionSettings(editionId);

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
      <section aria-labelledby="missions-title" className="flex flex-col gap-2">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="missions-title" className="font-display text-3xl text-ink">
            Missions <em className="text-muted">et jauges</em>
          </h2>
          <AdminButtonLink href="/admin/planning" size="sm" variant="ghost">
            Ajuster par créneau →
          </AdminButtonLink>
        </div>
        <p className="text-sm text-muted">
          « Sur attribution » réserve la mission à la régie : les bénévoles ne la voient pas dans leur planning.
          « Appliquer » fixe la même jauge sur tous les créneaux de la mission.
        </p>
        {missions.length === 0 ? (
          <EmptyState title="Aucune mission pour l'instant.">Créez la première avec le formulaire.</EmptyState>
        ) : (
          <ul className="flex flex-col">
            {missions.map((mission) => (
              <MissionSettingsRow key={mission.id} mission={mission} />
            ))}
          </ul>
        )}
      </section>
      <section aria-labelledby="new-mission-title" className="flex flex-col gap-4 self-start rounded-3xl border border-line bg-surface p-7">
        <h2 id="new-mission-title" className="font-display text-3xl text-ink">
          Nouvelle <em className="text-accent-strong">mission</em>
        </h2>
        <CreateMissionForm />
      </section>
    </div>
  );
}
