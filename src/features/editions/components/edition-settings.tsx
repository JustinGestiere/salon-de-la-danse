import { getTemplateEdition, listEditions } from "@/features/editions/admin-queries";
import { utcToZonedLocalInput } from "@/features/editions/dates";
import { suggestFirstEdition, suggestNextEdition } from "@/features/editions/next-edition";
import { CreateEditionForm } from "@/features/editions/components/create-edition-form";
import { EditionList } from "@/features/editions/components/edition-list";

/// Onglet « Éditions » : historique, archivage et préparation de l'année suivante.
export async function EditionSettings({ activeEditionId }: { activeEditionId: string | null }) {
  const [editions, template] = await Promise.all([listEditions(), getTemplateEdition()]);
  const today = utcToZonedLocalInput(new Date()).slice(0, 10);
  const templateSummary = editions.find((edition) => edition.id === template?.id);
  const initialValues = template
    ? {
        ...suggestNextEdition(
          {
            name: template.name,
            firstDay: templateSummary?.firstDay ?? null,
            opensAt: template.registrationOpensAt,
            closesAt: template.registrationClosesAt,
          },
          today,
        ),
        // Un modèle déjà archivé n'a pas à l'être une seconde fois.
        archiveCurrent: !template.isArchived,
      }
    : suggestFirstEdition(today);

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
      <section aria-labelledby="editions-title" className="flex flex-col gap-2">
        <h2 id="editions-title" className="font-display text-3xl text-ink">
          Toutes les <em className="text-muted">éditions</em>
        </h2>
        <p className="text-sm text-muted">
          Une édition archivée ne reçoit plus d'inscriptions, ses listes restent téléchargeables. Les bénévoles ne sont
          jamais repris d'une année à l'autre.
        </p>
        <EditionList editions={editions} activeEditionId={activeEditionId} />
      </section>
      <section aria-labelledby="new-edition-title" className="flex flex-col gap-4 self-start rounded-3xl border border-line bg-surface p-7">
        <h2 id="new-edition-title" className="font-display text-3xl text-ink">
          Préparer <em className="text-accent-strong">{initialValues.firstDay.slice(0, 4)}</em>
        </h2>
        <CreateEditionForm
          initialValues={initialValues}
          templateEditionName={template?.name ?? null}
          canArchiveTemplate={template ? !template.isArchived : false}
        />
      </section>
    </div>
  );
}
