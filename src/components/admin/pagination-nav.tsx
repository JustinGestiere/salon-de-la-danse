import { AdminButtonLink } from "@/components/admin/admin-button";

type PaginationNavProps = {
  page: number;
  pageCount: number;
  total: number;
  itemLabel: string;
  buildHref: (page: number) => string;
};

export function PaginationNav({ page, pageCount, total, itemLabel, buildHref }: PaginationNavProps) {
  if (pageCount <= 1) {
    return <p className="text-xs text-subtle">{`${total} ${itemLabel}`}</p>;
  }

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-4 text-sm">
      <span className="text-subtle">
        Page {page} sur {pageCount} · {total} {itemLabel}
      </span>
      <span className="flex gap-2">
        {page > 1 ? (
          <AdminButtonLink href={buildHref(page - 1)} size="sm">
            Précédent
          </AdminButtonLink>
        ) : null}
        {page < pageCount ? (
          <AdminButtonLink href={buildHref(page + 1)} size="sm">
            Suivant
          </AdminButtonLink>
        ) : null}
      </span>
    </nav>
  );
}
