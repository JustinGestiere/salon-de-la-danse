import Link from "next/link";

import { EmptyState } from "@/components/admin/empty-state";
import { StatusPill, type StatusTone } from "@/components/admin/status-pill";
import {
  INVITATION_STATUS_LABELS,
  type InvitationStatus,
} from "@/features/invitations/constants";
import { DeleteInvitationButton } from "@/features/invitations/components/delete-invitation-button";
import { ResendInvitationButton } from "@/features/invitations/components/resend-invitation-button";
import type { InvitationRow } from "@/features/invitations/queries";

const STATUS_TONES: Record<InvitationStatus, StatusTone> = {
  available: "warn",
  used: "ok",
  expired: "danger",
};

const STUB_CLASSES: Record<InvitationStatus, string> = {
  available: "bg-warn-soft",
  used: "bg-ok-soft",
  expired: "",
};

/// Utilitaire propre à cette feature : lib/format.ts ne formate que les dates
/// de l'évènement, pas les horodatages de gestion.
function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Europe/Paris",
  }).format(value);
}

function describeDelivery(row: InvitationRow): string {
  if (!row.email) return "";
  return row.sentAt ? ` · envoyé le ${formatDate(row.sentAt)}` : " · pas encore envoyé";
}

function describeRow(row: InvitationRow): string {
  if (row.status === "used" && row.volunteerName) return `Compte créé par ${row.volunteerName}`;
  if (row.status === "expired" && row.expiresAt) return `Expiré le ${formatDate(row.expiresAt)}`;
  const expiry = row.expiresAt ? ` · expire le ${formatDate(row.expiresAt)}` : "";
  return `Émis le ${formatDate(row.createdAt)}${expiry}${describeDelivery(row)}`;
}

type InvitationTableProps = {
  rows: readonly InvitationRow[];
};

export function InvitationTable({ rows }: InvitationTableProps) {
  if (rows.length === 0) {
    return <EmptyState title="Aucun code ici.">Aucun code ne correspond à ces filtres.</EmptyState>;
  }

  return (
    <ul aria-label="Codes d'invitation, du plus récent au plus ancien" className="flex flex-col gap-2">
      {rows.map((row) => (
        <li
          key={row.id}
          className="flex min-h-16 flex-col overflow-hidden rounded-2xl border border-line bg-surface sm:flex-row"
        >
          <div
            className={`flex items-center border-dashed border-line-strong px-5 py-3 sm:w-44 sm:shrink-0 sm:border-r ${STUB_CLASSES[row.status]}`}
          >
            <span
              className={`font-code text-sm tracking-wide ${row.status === "expired" ? "text-subtle line-through" : "text-ink"}`}
            >
              {row.code}
            </span>
          </div>
          <div className="flex flex-1 flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3">
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate text-sm font-medium text-ink">{row.email ?? "Code anonyme"}</span>
              <span className="text-xs text-subtle">{describeRow(row)}</span>
            </div>
            <StatusPill tone={STATUS_TONES[row.status]}>{INVITATION_STATUS_LABELS[row.status]}</StatusPill>
            <div className="flex min-w-32 flex-wrap justify-end gap-2">
              {row.status === "used" && row.badgeNumber ? (
                <Link
                  href={`/admin/benevoles?q=${encodeURIComponent(row.badgeNumber)}`}
                  className="text-xs font-medium text-accent hover:underline"
                >
                  Voir la fiche →
                </Link>
              ) : null}
              {row.status === "available" && row.email ? <ResendInvitationButton invitationId={row.id} /> : null}
              {row.status !== "used" ? (
                <DeleteInvitationButton invitationId={row.id} code={row.code} />
              ) : null}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
