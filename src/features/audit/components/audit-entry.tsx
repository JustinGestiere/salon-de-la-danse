import Link from "next/link";

import { EVENT_TIME_ZONE } from "@/lib/format";
import { AUDIT_CATEGORY_LABELS } from "@/features/audit/constants";
import { describeAuditEntry } from "@/features/audit/describe";
import { toAuditDiffView } from "@/features/audit/fields";
import type { AuditJournalEntry } from "@/features/audit/queries";
import { AUDIT_CATEGORY_DOT_CLASSES } from "@/features/audit/components/category-styles";

const TIME_FORMAT = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: EVENT_TIME_ZONE });

function buildTargetHref(entry: AuditJournalEntry): string | null {
  return entry.entityType === "volunteer" ? `/admin/benevoles?benevole=${entry.entityId}` : null;
}

export function AuditEntry({ entry }: { entry: AuditJournalEntry }) {
  const description = describeAuditEntry(entry.action, entry.changes);
  // Certaines actions tracent tous les champs d'un formulaire : on n'affiche
  // que ceux qui ont réellement changé.
  const diffs = description.diffs.filter((diff) => diff.before !== diff.after).map(toAuditDiffView);
  const targetHref = buildTargetHref(entry);

  return (
    <article className="grid grid-cols-[48px_12px_minmax(0,1fr)] gap-4 border-b border-line py-4">
      <time dateTime={entry.createdAt.toISOString()} className="pt-0.5 font-code text-[13px] text-muted">
        {TIME_FORMAT.format(entry.createdAt)}
      </time>
      <span
        aria-hidden="true"
        className={`mt-1.5 size-[9px] rounded-full ring-4 ring-raised ${entry.category ? AUDIT_CATEGORY_DOT_CLASSES[entry.category] : "bg-subtle"}`}
      />
      <div className="flex min-w-0 flex-col gap-2">
        <p className="text-[15px] leading-relaxed text-ink-soft">
          <span className="font-semibold text-ink">{entry.actorName ?? "Compte supprimé"}</span> {description.sentence}{" "}
          {description.target && targetHref ? (
            <Link href={targetHref} className="font-semibold text-ink underline decoration-accent underline-offset-4">
              {description.target}
            </Link>
          ) : (
            <span className="font-semibold text-ink">{description.target}</span>
          )}
        </p>
        <div className="flex flex-wrap items-center gap-2 text-[13px]">
          {diffs.map((diff) => (
            <span key={diff.label} className="inline-flex flex-wrap items-center gap-1.5">
              <span className="text-subtle">{diff.label} :</span>
              {diff.before !== null ? (
                <>
                  <del className="rounded-full bg-surface px-2.5 py-0.5 text-subtle">{diff.before}</del>
                  <span aria-hidden="true" className="text-subtle">
                    →
                  </span>
                </>
              ) : null}
              <ins className="rounded-full bg-raised px-2.5 py-0.5 text-ink no-underline">{diff.after ?? "vide"}</ins>
            </span>
          ))}
          {description.override ? (
            <span title={description.override} className="rounded-full border border-accent px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-accent">
              Dérogation
            </span>
          ) : null}
          {entry.category ? <span className="text-subtle">· {AUDIT_CATEGORY_LABELS[entry.category]}</span> : null}
        </div>
        {description.override ? <p className="text-xs text-muted">Règle outrepassée : {description.override}</p> : null}
      </div>
    </article>
  );
}
