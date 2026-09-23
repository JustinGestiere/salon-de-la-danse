import { z } from "zod";

import {
  AUDIT_ACTION_SENTENCES,
  AUDIT_CATEGORIES,
  AUDIT_CATEGORY_PREFIXES,
  type AuditCategory,
} from "@/features/audit/constants";

const scalarSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);

/// Le champ `changes` est du JSON libre en base : on le valide avant de
/// l'afficher plutôt que de faire confiance à sa forme.
const changesSchema = z
  .object({
    target: z.string().optional(),
    before: z.record(z.string(), scalarSchema).optional(),
    after: z.record(z.string(), scalarSchema).optional(),
    override: z.string().optional(),
    code: z.string().optional(),
    count: z.number().optional(),
  })
  .loose();

export type AuditDiff = {
  field: string;
  before: string | null;
  after: string | null;
};

export type AuditDescription = {
  sentence: string;
  target: string | null;
  diffs: AuditDiff[];
  override: string | null;
};

function formatScalar(value: string | number | boolean | null | undefined): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value === "boolean") return value ? "oui" : "non";
  return String(value);
}

/// Cible lisible des anciennes lignes, écrites avant l'ajout du champ `target`.
function legacyTarget(changes: z.infer<typeof changesSchema>): string | null {
  if (changes.code) return changes.code;
  if (changes.count !== undefined) return `${changes.count} code${changes.count > 1 ? "s" : ""}`;
  return null;
}

export function describeAuditEntry(action: string, rawChanges: unknown): AuditDescription {
  const parsed = changesSchema.safeParse(rawChanges ?? {});
  const changes = parsed.success ? parsed.data : {};
  const before = changes.before ?? {};
  const after = changes.after ?? {};
  const fields = [...new Set([...Object.keys(before), ...Object.keys(after)])];

  return {
    sentence: AUDIT_ACTION_SENTENCES[action] ?? action,
    target: changes.target ?? legacyTarget(changes),
    diffs: fields.map((field) => ({
      field,
      before: formatScalar(before[field]),
      after: formatScalar(after[field]),
    })),
    override: changes.override ?? null,
  };
}

export function categorizeAuditAction(action: string): AuditCategory | null {
  const prefix = action.split(".")[0] ?? "";
  return (
    AUDIT_CATEGORIES.find((category) => AUDIT_CATEGORY_PREFIXES[category].includes(prefix)) ?? null
  );
}
