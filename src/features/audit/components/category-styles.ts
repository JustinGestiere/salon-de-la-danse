import type { AuditCategory } from "@/features/audit/constants";

/// Pastille de couleur par catégorie : toujours accompagnée de son libellé.
export const AUDIT_CATEGORY_DOT_CLASSES: Record<AuditCategory, string> = {
  volunteer: "bg-accent",
  assignment: "bg-lilac",
  grid: "bg-warn",
  invitation: "bg-ok",
  edition: "bg-ink-soft",
};
