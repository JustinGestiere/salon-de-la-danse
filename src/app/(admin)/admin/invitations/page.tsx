import type { Metadata } from "next";

import { AdminAlert } from "@/components/admin/admin-alert";
import { PageHeader } from "@/components/admin/page-header";
import { PaginationNav } from "@/components/admin/pagination-nav";
import { requireAdmin } from "@/features/admin/guards";
import { getActiveEdition } from "@/features/editions/queries";
import { GenerateCodesForm } from "@/features/invitations/components/generate-codes-form";
import { InvitationFilterBar } from "@/features/invitations/components/invitation-filter-bar";
import { InvitationTable } from "@/features/invitations/components/invitation-table";
import { getInvitationCounts, listInvitations } from "@/features/invitations/queries";
import { invitationFilterSchema } from "@/features/invitations/schemas";

export const metadata: Metadata = {
  title: "Invitations · Régie du Salon de la Danse",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function buildPageHref(
  params: Record<string, string | string[] | undefined>,
  page: number,
): string {
  const next = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (key === "page") continue;
    if (typeof value === "string" && value.length > 0) next.set(key, value);
  }
  next.set("page", String(page));
  return `/admin/invitations?${next.toString()}`;
}

export default async function InvitationsPage({ searchParams }: PageProps) {
  await requireAdmin();

  const edition = await getActiveEdition();
  if (!edition) {
    return (
      <AdminAlert tone="warning">
        Aucune édition active. Créez une édition avant de générer des codes.
      </AdminAlert>
    );
  }

  const rawParams = await searchParams;
  const filter = invitationFilterSchema.parse({
    status: typeof rawParams.status === "string" ? rawParams.status : undefined,
    q: typeof rawParams.q === "string" ? rawParams.q : undefined,
    page: rawParams.page,
  });

  const [counts, invitations] = await Promise.all([
    getInvitationCounts(edition.id),
    listInvitations(edition.id, filter),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        kicker="Les laissez-passer"
        title="Invitations"
        description="La sélection se fait hors plateforme. Émettez ici un code par candidat retenu : sans code valide, impossible de créer un compte bénévole."
      />

      <div className="grid items-start gap-10 lg:grid-cols-[440px_minmax(0,1fr)]">
        <GenerateCodesForm />

        <section aria-labelledby="ledger-title" className="flex min-w-0 flex-col gap-5">
          <div className="flex flex-col gap-1">
            <h2 id="ledger-title" className="font-display text-3xl text-ink">
              Registre des codes
            </h2>
            <p className="text-sm text-muted">
              <span className="font-semibold text-accent-strong">
                {counts.used} sur {counts.total}
              </span>{" "}
              ont servi à créer un compte.
            </p>
          </div>
          <InvitationFilterBar counts={counts} />
          <InvitationTable rows={invitations.rows} />
          <PaginationNav
            page={invitations.page}
            pageCount={invitations.pageCount}
            total={invitations.total}
            itemLabel="codes"
            buildHref={(page) => buildPageHref(rawParams, page)}
          />
        </section>
      </div>
    </div>
  );
}
