import { AdminButtonLink } from "@/components/admin/admin-button";
import { EmptyState } from "@/components/admin/empty-state";

/// Ressource absente dans le back-office (bénévole, badge scanné d'une autre
/// édition…) : affichée dans le thème de la régie plutôt que dans celui de
/// l'espace bénévole.
export default function AdminNotFound() {
  return (
    <div className="flex flex-col items-start gap-4">
      <EmptyState title="Introuvable dans l'édition en cours.">
        Le lien est peut-être ancien, ou la fiche appartient à une édition archivée.
      </EmptyState>
      <AdminButtonLink href="/admin/tableau-de-bord" variant="secondary">
        Retour à la vue d'ensemble
      </AdminButtonLink>
    </div>
  );
}
