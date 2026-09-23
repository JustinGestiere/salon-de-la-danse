import Link from "next/link";

import type { BadgeHolder } from "@/features/badges/queries";

/// Bénévoles dont le badge ne peut pas être imprimé faute de photo. La photo se
/// dépose depuis leur fiche.
export function MissingPhotoList({ holders }: { holders: readonly BadgeHolder[] }) {
  if (holders.length === 0) return null;

  return (
    <section aria-labelledby="missing-title" className="flex flex-col gap-2 rounded-2xl border border-danger/40 bg-danger-soft px-4 py-4">
      <h2 id="missing-title" className="text-sm font-semibold text-danger-ink">
        {holders.length} badge{holders.length > 1 ? "s" : ""} bloqué{holders.length > 1 ? "s" : ""} : photo manquante
      </h2>
      <ul className="flex flex-col gap-1.5">
        {holders.map((holder) => (
          <li key={holder.id} className="flex items-center justify-between gap-3 text-sm text-ink-soft">
            <span>
              {holder.firstName} {holder.lastName}
            </span>
            <Link href={`/admin/benevoles?benevole=${holder.id}`} className="text-xs font-medium text-danger-ink underline underline-offset-4">
              Voir la fiche
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
