import type { Metadata } from "next";

import { AdminAlert } from "@/components/admin/admin-alert";
import { EmptyState } from "@/components/admin/empty-state";
import { PaginationNav } from "@/components/admin/pagination-nav";
import { buildQueryHref, toQueryParams } from "@/lib/url";
import { requireAdmin } from "@/features/admin/guards";
import { AuditCategoryNav } from "@/features/audit/components/audit-category-nav";
import { AuditEntry } from "@/features/audit/components/audit-entry";
import { groupByEventDay } from "@/features/audit/day-groups";
import { getAuditCategoryCounts, listAuditEntries } from "@/features/audit/queries";
import { auditJournalParamsSchema } from "@/features/audit/schemas";
import { getActiveEdition } from "@/features/editions/queries";

export const metadata: Metadata = {
  title: "Journal · Régie du Salon de la Danse",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminJournalPage({ searchParams }: PageProps) {
  await requireAdmin();
  const edition = await getActiveEdition();
  if (!edition) return <AdminAlert tone="warning">Aucune édition active.</AdminAlert>;

  const params = toQueryParams(await searchParams);
  const query = auditJournalParamsSchema.parse(params);
  const [journal, counts] = await Promise.all([listAuditEntries(edition.id, query), getAuditCategoryCounts(edition.id)]);
  const groups = groupByEventDay(journal.entries, new Date());

  return (
    <div className="grid gap-12 lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-subtle">Le registre de régie</p>
          <h1 className="font-display text-5xl leading-none text-ink">Journal</h1>
          <p className="text-sm leading-relaxed text-muted">Chaque modification faite par un admin, horodatée. Rien ne s'efface.</p>
        </div>
        <AuditCategoryNav activeCategory={query.categorie} counts={counts} />
      </aside>
      <section aria-label="Historique" className="flex flex-col gap-8">
        {groups.length === 0 ? <EmptyState title="Rien dans cette catégorie pour l'instant." /> : null}
        {groups.map((group) => (
          <div key={group.day} className="flex flex-col">
            <div className="flex items-baseline gap-3.5 pb-1.5">
              <h2 className="font-display text-3xl italic text-ink first-letter:uppercase">{group.label}</h2>
              <span className="font-code text-xs text-subtle">{group.day.split("-").reverse().join("/")}</span>
            </div>
            {group.items.map((entry) => (
              <AuditEntry key={entry.id} entry={entry} />
            ))}
          </div>
        ))}
        <PaginationNav
          page={journal.page}
          pageCount={journal.pageCount}
          total={journal.total}
          itemLabel="entrées"
          buildHref={(page) => buildQueryHref("/admin/journal", params, { page: String(page) })}
        />
      </section>
    </div>
  );
}
