import Link from "next/link";

import { AUDIT_CATEGORIES, AUDIT_CATEGORY_LABELS, type AuditCategory } from "@/features/audit/constants";
import type { AuditCategoryCounts } from "@/features/audit/queries";
import { AUDIT_CATEGORY_DOT_CLASSES } from "@/features/audit/components/category-styles";

type AuditCategoryNavProps = {
  activeCategory: AuditCategory | undefined;
  counts: AuditCategoryCounts;
};

const ALL_ENTRY = { key: "all", label: "Tout", href: "/admin/journal", dotClass: "bg-ink" } as const;

export function AuditCategoryNav({ activeCategory, counts }: AuditCategoryNavProps) {
  const entries = [
    ALL_ENTRY,
    ...AUDIT_CATEGORIES.map((category) => ({
      key: category,
      label: AUDIT_CATEGORY_LABELS[category],
      href: `/admin/journal?categorie=${category}`,
      dotClass: AUDIT_CATEGORY_DOT_CLASSES[category],
    })),
  ];

  return (
    <nav aria-label="Catégories du journal" className="flex flex-col gap-0.5">
      {entries.map((entry) => {
        const isActive = entry.key === (activeCategory ?? "all");
        return (
          <Link
            key={entry.key}
            href={entry.href}
            aria-current={isActive ? "page" : undefined}
            className={`flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-medium transition ${
              isActive ? "bg-raised text-ink" : "text-ink-soft hover:bg-raised/60"
            }`}
          >
            <span aria-hidden="true" className={`size-[7px] shrink-0 rounded-full ${entry.dotClass}`} />
            <span className="flex-1">{entry.label}</span>
            <span className="text-xs text-subtle">{counts[entry.key]}</span>
          </Link>
        );
      })}
    </nav>
  );
}
