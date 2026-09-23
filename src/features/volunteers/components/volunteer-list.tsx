import Link from "next/link";

import { EmptyState } from "@/components/admin/empty-state";
import { buildQueryHref, type QueryParams } from "@/lib/url";
import type { VolunteerListRow } from "@/features/volunteers/admin-queries";
import {
  VOLUNTEER_AVATAR_CLASSES,
  VOLUNTEER_STATUS_TEXT_CLASSES,
} from "@/features/volunteers/components/status-display";
import { VOLUNTEER_STATUS_LABELS, deriveVolunteerStatus } from "@/features/volunteers/status";

type VolunteerListProps = {
  rows: readonly VolunteerListRow[];
  selectedId: string | null;
  params: QueryParams;
  maxSlots: number;
};

function describeRow(row: VolunteerListRow): string {
  const missions = row.missionNames.length > 0 ? row.missionNames.join(", ") : "Aucun créneau choisi";
  return `${row.badgeNumber} · ${missions}`;
}

export function VolunteerList({ rows, selectedId, params, maxSlots }: VolunteerListProps) {
  if (rows.length === 0) {
    return (
      <EmptyState title="Personne en coulisses.">Aucun bénévole ne correspond à cette recherche.</EmptyState>
    );
  }

  return (
    <ul aria-label="Bénévoles" className="flex flex-col gap-0.5">
      {rows.map((row) => {
        const status = deriveVolunteerStatus(row.planningStatus, row.assignmentCount);
        const isSelected = row.id === selectedId;
        return (
          <li key={row.id}>
            <Link
              href={buildQueryHref("/admin/benevoles", params, { benevole: row.id })}
              aria-current={isSelected ? "true" : undefined}
              scroll={false}
              className={`flex items-center gap-3.5 rounded-2xl px-3.5 py-3 transition ${isSelected ? "bg-raised" : "hover:bg-surface"}`}
            >
              <span
                aria-hidden="true"
                className={`grid size-11 shrink-0 place-items-center rounded-full font-display text-lg ${VOLUNTEER_AVATAR_CLASSES[status]}`}
              >
                {row.firstName.charAt(0)}
                {row.lastName.charAt(0)}
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="flex items-center gap-2 text-[15px] font-semibold text-ink">
                  {row.firstName} {row.lastName}
                  {row.isMinorPending ? (
                    <span className="rounded-full bg-danger-soft px-2 py-0.5 text-[11px] font-medium text-danger-ink">
                      Mineur
                    </span>
                  ) : null}
                </span>
                <span className="truncate text-xs text-subtle">{describeRow(row)}</span>
              </span>
              <span className="flex shrink-0 flex-col items-end gap-1.5">
                <span aria-label={`${row.assignmentCount} créneau(x) sur ${maxSlots}`} className="flex gap-1">
                  {Array.from({ length: maxSlots }, (_, index) => (
                    <span
                      key={index}
                      className={`size-[7px] rounded-full border ${index < row.assignmentCount ? "border-ink bg-ink" : "border-line-strong"}`}
                    />
                  ))}
                </span>
                <span className={`text-xs font-medium ${VOLUNTEER_STATUS_TEXT_CLASSES[status]}`}>
                  {VOLUNTEER_STATUS_LABELS[status]}
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
